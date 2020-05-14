#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string.h>
#include <signal.h>
#include "socket.h"

#ifndef PORT
    #define PORT 58516
#endif

#define LISTEN_SIZE 5
#define WELCOME_MSG "Welcome to CSC209 Twitter! Enter your username: \r\n"
#define SEND_MSG "send "
#define SHOW_MSG "show"
#define FOLLOW_MSG "follow "
#define UNFOLLOW_MSG "unfollow "
#define QUIT_MSG "quit"
#define BUF_SIZE 256
#define MSG_LIMIT 8
#define FOLLOW_LIMIT 5

struct client {
    int fd;
    struct in_addr ipaddr;
    char username[BUF_SIZE];
    char message[MSG_LIMIT][BUF_SIZE];
    struct client *following[FOLLOW_LIMIT]; // Clients this user is following
    struct client *followers[FOLLOW_LIMIT]; // Clients who follow this user
    char inbuf[BUF_SIZE]; // Used to hold input from the client
    char *in_ptr; // A pointer into inbuf to help with partial reads
    struct client *next;
    // Used for indexing contiguous following, follower, and message lists.
    int num_following;
    int num_followers;
    int num_messages;
};


// Provided functions.
void add_client(struct client **clients, int fd, struct in_addr addr);
void remove_client(struct client **clients, int fd);

// These are some of the function prototypes that we used in our solution
// You are not required to write functions that match these prototypes, but
// you may find them helpful when thinking about operations in your program.

// Send the message in s to all clients in active_clients.
void announce(struct client *active_clients, char *s);

// Move client c from new_clients list to active_clients list.
void activate_client(struct client *c, struct client **active_clients_ptr, struct client **new_clients_ptr) {
    // Remove the client from the new clients list. The first case is the
    // client is at the head of the new clients list and the new head is the
    // second element.

    if (*new_clients_ptr == c) {
        *new_clients_ptr = c->next;
    } /* If the client is not the head, then the next pointer of the element
    before element points to the element after client. */
    else {
        struct client *curr_client = *new_clients_ptr;

        while (curr_client->next != c) {
            curr_client = curr_client->next;
        }
        // curr_client is now the element before c.
        curr_client->next = c->next;
    }

    // Add the client to be the head of the clients list.
    c->next = *active_clients_ptr;
    *active_clients_ptr = c;
}



// The set of socket descriptors for select to monitor.
// This is a global variable because we need to remove socket descriptors
// from allset when a write to a socket fails.
fd_set allset;

/*
 * Create a new client, initialize it, and add it to the head of the linked
 * list.
 */
void add_client(struct client **clients, int fd, struct in_addr addr) {
    struct client *p = malloc(sizeof(struct client));

    if (!p) {
        perror("malloc");
        exit(1);
    }

    printf("Adding client %s\n", inet_ntoa(addr));
    p->fd = fd;
    p->ipaddr = addr;
    p->username[0] = '\0';
    p->in_ptr = p->inbuf;
    p->inbuf[0] = '\0';
    p->next = *clients;
    // Initialize the follower, following, and message counts to 0.
    p->num_following = 0;
    p->num_followers = 0;
    p->num_messages = 0;

    // initialize messages to empty strings
    for (int i = 0; i < MSG_LIMIT; i++) {
        p->message[i][0] = '\0';
    }

    // Initialize follower and followed users to be empty.
    for (int i = 0; i < FOLLOW_LIMIT; i++) {
        p->following[i] = NULL;
        p->followers[i] = NULL;
    }

    *clients = p;
}

/* Read input from the client's file descriptor until a network newline is found
 and append the data from each iteration to the client's buffer.*/
int read_input(struct client *read_client) {
    /* Keeps track of the total number of bytes read, including two characters
    for a network newline. */
    int num_read = 0;
    // This being 0 is the condition for the read loop to end.
    int newline_not_found = 1;

    while (newline_not_found) {
        /* in_ptr will always point to the first element of the client's buffer
        that was not read. */
        int num_read_iteration = read(read_client->fd, read_client->in_ptr, BUF_SIZE - num_read);

        /* If 0 bytes were read this iteration, then the client has disconnected
        so run remove_client afterwards. */
        if (num_read_iteration == 0) {
            return 0;
        } else if (num_read_iteration == -1) {
            perror("read");
            exit(1);
        }

        // Update the total bytes read
        num_read += num_read_iteration;
        // Notify the server of the read.
        printf("Read %d bytes from file descriptor %d\n", num_read_iteration, read_client->fd);

        /* This loop searches for a network newline among the
        num_read_iteration - 1 pairs of consecutive characters in the data read.
         */
        for (int i = 0; i < num_read_iteration - 1; i++) {
            if (read_client->in_ptr[i] == '\r' && read_client->in_ptr[i + 1] == '\n') {
                printf("Found newline from file descriptor %d\n", read_client->fd);
                /* The read loop ends so in_ptr resets to the start of the
                buffer to be used for the next client input. */
                read_client->in_ptr = read_client->inbuf;

                // Remove the network newline from the full input.
                read_client->inbuf[num_read - 2] = '\0';
                read_client->inbuf[num_read - 1] = '\0';

                newline_not_found = 0;

                break;
            }
        }

        /* in_ptr is updated for the next read in the loop if the network
        newline is not found. If it was found, then in_ptr was already updated
        to be the start of inbuf. */
        if (newline_not_found) {
            read_client->in_ptr = read_client->in_ptr + num_read_iteration;
        }
    }

    return num_read;
}

/* Find a target client by username when a user issues a follow or unfollow
and assign it to be pointed by target_client_ptr. */
struct client* find_client(char *client_name, struct client *active_clients, int *found_client) {
    // Checks every active client if its name matches client_name.
    for (struct client *curr_client = active_clients; curr_client; curr_client = curr_client->next) {
        /* If the current client's name matches with the target name, then
        assign it to be pointed by target_client_ptr. */
        if (strcmp(curr_client->username, client_name) == 0) {
            *found_client = 1;
            return curr_client;
        }
    }

    *found_client = 0;
    return active_clients;
}

/* When a user follows another user, update the following list and following
count of the follower and the followers list and followers count of the followed
user. Write messages indicating the validity of the command. */
void update_following(struct client *follower, struct client* followed, char (*notification)[BUF_SIZE]) {
    /* Add follower only if the following limit of the follower and follower
    limit of the followed user have not been reached. */
    if (follower->num_following < FOLLOW_LIMIT) {
        if (followed->num_followers < FOLLOW_LIMIT) {
            int already_followed = 0;

            // Check if the follower has already followed this user.
            for (int followed_index = 0; followed_index < follower->num_following; followed_index++) {
                if ((follower->following)[followed_index]->fd == followed->fd) {
                    already_followed = 1;
                    break;
                }
            }

            if (!already_followed) {
                /* Update the following list of the follower and followers list
                of the followed user */
                (follower->following)[follower->num_following] = followed;
                (followed->followers)[followed->num_followers] = follower;

                /* Update the following count of the follower and follower
                count of the followed user. */
                follower->num_following++;
                followed->num_followers++;

                // Write a success notification to the server and the follower.
                printf("%s has followed %s.\n", follower->username, followed->username);
                strncpy(*notification, "You are now following this user.\r\n", BUF_SIZE);
            } // The below are the scenarios in which the follow command fails.
            else {
                strncpy(*notification, "You have already followed this person.\r\n", BUF_SIZE);
            }
        } else {
            strncpy(*notification, "You cannot follow this person because they are at their follower limit.\r\n", BUF_SIZE);
        }
    } else {
        strncpy(*notification, "You cannot follow this person because you are at your following limit.\r\n", BUF_SIZE);
    }
}

/* When a user unfollows a user, update the following list and following count
of the follower and the follower list and following count of the followed user.
*/
int update_unfollowing(struct client *follower, struct client* followed) {
    /* Indicates when the function returns whether the specified follower user
    was found. */
    int found_following = 0;

    /* Find the index of the user specified by the unfollow command in the
    follower's following list. */
    for (int followed_index = 0; followed_index < follower->num_following; followed_index++) {
        if ((follower->following)[followed_index]->fd == followed->fd) {
            /* Move the followed user nearest to the end of the followed user
            list to the spot of the removed followed user. This ensures that the
            followed user list is always contiguous. */
            (follower->following)[followed_index] = (follower->following)[follower->num_following - 1];
            (follower->following)[follower->num_following - 1] = NULL;

            // Update followed user count.
            follower->num_following--;

            // A match to the specified followed user was found.
            found_following = 1;

            break;
        }
    }

    /* If a followed user was found, then remove the follower from the
    follower's list of the followed user. */
    if (found_following) {
        for (int follower_index = 0; follower_index < followed->num_followers; follower_index++) {
            if ((followed->followers)[follower_index]->fd == follower->fd) {
                /* Move the follower nearest to the end of the follower list to
                the spot of the removed follower. This ensures that the follower
                list is always contiguous. */
                (followed->followers)[follower_index] = (followed->followers)[followed->num_followers - 1];
                (followed->followers)[followed->num_followers - 1] = NULL;

                // Update follower count.
                followed->num_followers--;

                break;
            }
        }
    }

    return found_following;
}

/* Performs the function of update_unfollowing but writes messages to the screen
and follower as well. This is used for the unfollow command while the no
message version is used when updating an unfollow due to a disconnect and no
messages should be shown. */
void update_unfollowing_notif(struct client *follower, struct client* followed, char (*notification)[BUF_SIZE]) {
    int found_following = update_unfollowing(follower, followed);

    // The unfollow command was valid.
    if (found_following) {
        strncpy(*notification, "You are no longer following this person.\r\n", BUF_SIZE);
        printf("%s has unfollowed %s.\n", follower->username, followed->username);
    } /* No user was found matching the followed user in the call to
    update_unfollowing. */
    else {
        strncpy(*notification, "You cannot unfollow this person because you were not following them.\r\n", BUF_SIZE);
    }
}

/*
 * Remove client from the linked list and close its socket.
 * Also, remove socket descriptor from allset.
 */
void remove_client(struct client **clients, int fd) {
    struct client **p;

    for (p = clients; *p && (*p)->fd != fd; p = &(*p)->next)
        ;

    // Now, p points to (1) top, or (2) a pointer to another client
    // This avoids a special case for removing the head of the list
    if (*p) {
        // TODO: Remove the client from other clients' following/followers
        // lists

        /* The loop removes this client from the following list of all users
        this client was following. */
        for (int following_index = 0; following_index < (*p)->num_following; following_index++) {
            update_unfollowing(*p, ((*p)->following)[following_index]);
        }

        // This loop unfollows every follower of the client from the client.
        for (int follower_index = 0; follower_index < (*p)->num_followers; follower_index++) {
            update_unfollowing(((*p)->followers)[follower_index], *p);
        }

        // Remove the client
        struct client *t = (*p)->next;
        printf("Removing client %d %s\n", fd, inet_ntoa((*p)->ipaddr));
        FD_CLR((*p)->fd, &allset);
        close((*p)->fd);
        free(*p);
        *p = t;
    } else {
        fprintf(stderr,
            "Trying to remove fd %d, but I don't know about it\n", fd);
    }
}

/* Send a message to to_client when the sender issues a send command that is
valid. The message will contain the sender's username. */
void send_usernamed_message(struct client *sender, struct client *to_client, char *message, struct client *active_clients) {
    /* The full message contains the message substance, the sender's username,
    two bytes for a ": " in between, two bytes for a network newline, and a byte
    for the null terminator. */
    char usernamed_message[strlen(message) + strlen(sender->username) + 5];

    /* These string function calls build the message as specified above from
    left to right. */
    strncpy(usernamed_message, sender->username, strlen(sender->username));
    usernamed_message[strlen(sender->username)] = '\0';

    strncat(usernamed_message, ": ", 2);
    strncat(usernamed_message, message, strlen(message));
    strncat(usernamed_message, "\r\n", 2);

    // Write the message to to_client.
    int num_write = write(to_client->fd, usernamed_message, strlen(usernamed_message));

    if (num_write == -1) {
        perror("write");
        exit(1);
    } else if (num_write != strlen(usernamed_message)) {
        fprintf(stderr, "Write call failed.\n");
        remove_client(&active_clients, sender->fd);
    }
}

/* Performs the sending of all messages from all users the follower is following
when they issue a show command. */
int show_messages(struct client *follower, struct client *active_clients) {
    /* If no messages are shown when the function returns, notify the user that
    there are no messages to be shown. */
    int messages_shown = 0;

    /* For each user the follower is following and each message sent by such a
    user, send it to the follower with the followed's user's username. */
    for (int following_index = 0; following_index < follower->num_following; following_index++) {
        struct client *followed = (follower->following)[following_index];

        for (int message_index = 0; message_index < followed->num_messages; message_index++) {
            // Get the message substance and send it with the sender's username.
            char *message = (followed->message)[message_index];

            send_usernamed_message(followed, follower, message, active_clients);

            // Update the messages shown after successfully sending the message.
            messages_shown++;
        }
    }

    return messages_shown;
}

// Handles all cases of the send command.
void send_message(struct client *sender, char *message, char (*notification)[BUF_SIZE], struct client *active_clients) {
    // Message limit reached.
    if (sender->num_messages >= MSG_LIMIT) {
        strncpy(*notification, "Message was not sent because you are at your message limit.\r\n", BUF_SIZE);
    } // Message is blank.
    else if (strlen(message) == 0) {
        strncpy(*notification, "Message cannot be blank.\r\n", BUF_SIZE);
    } // Message too long.
    else if (strlen(message) > 140) {
        strncpy(*notification, "Message can be at most 140 characters long.\r\n", BUF_SIZE);
    } /* The send command was valid and send a message with the sender's
    username to each of their followers. */
    else {
        // Iterate over all of the sender's followers.
        for (int follower_index = 0; follower_index < sender->num_followers; follower_index++) {
            struct client *follower = (sender->followers)[follower_index];

            send_usernamed_message(sender, follower, message, active_clients);
        }
        /* Update the message list of the sender with the substance of the
        message. */
        strncpy((sender->message)[sender->num_messages], message, strlen(message));
        (sender->message)[sender->num_messages][strlen(message)] = '\0';

        // Increment the message count of the sender.
        sender->num_messages++;
    }
}

/* Display any notification to a user after they have entered their usernamed
or issued a command. */
void display_notification(struct client *to_client, char notification[BUF_SIZE], struct client **client_list_ptr) {
    // If notification has is blank, nothing is sent.
    if (strlen(notification) != 0) {
        // Write the notification to the user.
        int num_write = write(to_client->fd, notification, strlen(notification));

        if (num_write == -1) {
            perror("write");
            exit(1);
        } else if (num_write != strlen(notification)) {
            fprintf(stderr, "Write call failed.");
            remove_client(client_list_ptr, to_client->fd);
        }
    }
}

int main (int argc, char **argv) {
    int clientfd, maxfd, nready;
    struct client *p;
    struct sockaddr_in q;
    fd_set rset;

    // If the server writes to a socket that has been closed, the SIGPIPE
    // signal is sent and the process is terminated. To prevent the server
    // from terminating, ignore the SIGPIPE signal.
    struct sigaction sa;
    sa.sa_handler = SIG_IGN;
    sa.sa_flags = 0;
    sigemptyset(&sa.sa_mask);
    if (sigaction(SIGPIPE, &sa, NULL) == -1) {
        perror("sigaction");
        exit(1);
    }

    // A list of active clients (who have already entered their names).
    struct client *active_clients = NULL;

    // A list of clients who have not yet entered their names. This list is
    // kept separate from the list of active clients, because until a client
    // has entered their name, they should not issue commands or
    // or receive announcements.
    struct client *new_clients = NULL;

    struct sockaddr_in *server = init_server_addr(PORT);
    int listenfd = set_up_server_socket(server, LISTEN_SIZE);
    free(server);

    // Initialize allset and add listenfd to the set of file descriptors
    // passed into select
    FD_ZERO(&allset);
    FD_SET(listenfd, &allset);

    // maxfd identifies how far into the set to search
    maxfd = listenfd;

    while (1) {
        // make a copy of the set before we pass it into select
        rset = allset;

        nready = select(maxfd + 1, &rset, NULL, NULL, NULL);
        if (nready == -1) {
            perror("select");
            exit(1);
        } else if (nready == 0) {
            continue;
        }

        // check if a new client is connecting
        if (FD_ISSET(listenfd, &rset)) {
            printf("A new client is connecting\n");
            clientfd = accept_connection(listenfd, &q);

            FD_SET(clientfd, &allset);
            if (clientfd > maxfd) {
                maxfd = clientfd;
            }
            printf("Connection from %s\n", inet_ntoa(q.sin_addr));
            add_client(&new_clients, clientfd, q.sin_addr);
            char *greeting = WELCOME_MSG;
            if (write(clientfd, greeting, strlen(greeting)) == -1) {
                fprintf(stderr,
                    "Write to client %s failed\n", inet_ntoa(q.sin_addr));
                remove_client(&new_clients, clientfd);
            }
        }

        // Check which other socket descriptors have something ready to read.
        // The reason we iterate over the rset descriptors at the top level and
        // search through the two lists of clients each time is that it is
        // possible that a client will be removed in the middle of one of the
        // operations. This is also why we call break after handling the input.
        // If a client has been removed, the loop variables may no longer be
        // valid.
        int cur_fd, handled;
        for (cur_fd = 0; cur_fd <= maxfd; cur_fd++) {

            if (FD_ISSET(cur_fd, &rset)) {
                handled = 0;
                char notification[BUF_SIZE];

                for (int i = 0; i < BUF_SIZE; i++) {
                    notification[i] = '\0';
                }

                // Check if any new clients are entering their names
                for (p = new_clients; p != NULL; p = p->next) {
                    if (cur_fd == p->fd) {
                        /* Read the full username from the user until the
                        network newline. */
                        int num_read = read_input(p);

                        /* read_input returns with 0 is nothing was read, which
                        indicates the user has disconnected. */
                        if (num_read == 0) {
                            printf("%s has disconnected.\n", p->username);
                            remove_client(&new_clients, p->fd);
                        } /* If exactly two bytes were read, then they are the
                        network newline so the message username was blank. */
                        else if (num_read == 2) {
                            strncpy(notification, "Username cannot be blank, please enter another username.\r\n", BUF_SIZE);
                        } // A non-blank username was entered.
                        else {
                            int valid_username = 1;
                            struct client *curr_client;

                            /* Checks if any of the active clients have the
                            same username. */
                            for (curr_client = active_clients; curr_client; curr_client = curr_client->next) {
                                if (strcmp(curr_client->username, p->inbuf) == 0) {
                                    strncpy(notification, "Username already taken, please enter another username.\r\n", BUF_SIZE);
                                    valid_username = 0;

                                    break;
                                }
                            }

                            // The username is unique so it is valid.
                            if (valid_username) {
                                // Update the username field of the user.
                                strncpy(p->username, p->inbuf, num_read);
                                p->username[num_read] = '\0';

                                // Move the user to the active users list
                                activate_client(p, &active_clients, &new_clients);

                                /* Notify the server and user that the user
                                is active. */
                                strncpy(notification, "You have joined the chat.\r\n", BUF_SIZE);
                                printf("%s has joined.\n", p->username);
                            }
                        }

                        /* Display any notification to the user when entering
                        their username. */
                        display_notification(p, notification, &new_clients);

                        handled = 1;
                        break;
                    }
                }

                if (!handled) {
                    // Check if this socket descriptor is an active client
                    for (p = active_clients; p != NULL; p = p->next) {
                        if (cur_fd == p->fd) {
                            // TODO: handle input from an active client

                            /* read_input returns with 0 is nothing was read, which
                            indicates the user has disconnected. */
                            if (read_input(p) == 0) {
                                printf("%s has disconnected.\n", p->username);
                                remove_client(&active_clients, p->fd);
                                break;
                            }

                            // Notify server of the user input.
                            printf("Input from user %s: %s\n", p->username, p->inbuf);

                            // Deal with the follow and unfollow commands.
                            if ((strstr(p->inbuf, FOLLOW_MSG) == p->inbuf) || (strstr(p->inbuf, UNFOLLOW_MSG) == p->inbuf)) {
                                /* The target name of of the command depends
                                on the command. */
                                char *followed_name = (strstr(p->inbuf, FOLLOW_MSG) == p->inbuf) ?
                                &((p->inbuf)[strlen(FOLLOW_MSG)]) : &((p->inbuf)[strlen(UNFOLLOW_MSG)]);

                                int found_client = 0;
                                struct client *followed_client = find_client(followed_name, active_clients, &found_client);

                                /* If target user is active, then perform the
                                corresponding follow or unfollow logic. */
                                if (found_client != 0) {
                                    // Process follow commmand.
                                    if (strstr(p->inbuf, FOLLOW_MSG) == p->inbuf) {
                                        /* Compare the name of the user with
                                        the target name. */
                                        if (strcmp(followed_name, p->username) == 0) {
                                            strncpy(notification, "You cannot follow yourself.\r\n", BUF_SIZE);
                                        } else {
                                            update_following(p, followed_client, &notification);
                                        }
                                    } // Process unfollow command.
                                    else {
                                        /* Compare the name of the user with
                                        the target name. */
                                        if (strcmp(followed_name, p->username) == 0) {
                                            strncpy(notification, "You cannot unfollow yourself.\r\n", BUF_SIZE);
                                        } else {
                                            update_unfollowing_notif(p, followed_client, &notification);
                                        }
                                    }
                                } // Target user is not active.
                                else {
                                    strncpy(notification, "This person is not active.\r\n", BUF_SIZE);
                                }
                            } // Perform the show command.
                            else if (strcmp(p->inbuf, SHOW_MSG) == 0) {
                                if (show_messages(p, active_clients) == 0) {
                                    strncpy(notification, "No messages to show.\r\n", BUF_SIZE);
                                }
                            } // Perform the send command.
                            else if (strstr(p->inbuf, SEND_MSG) == p->inbuf) {
                                char *message = &((p->inbuf)[strlen(SEND_MSG)]);

                                send_message(p, message, &notification, active_clients);
                            } // Perform the quit command.
                            else if (strcmp(p->inbuf, QUIT_MSG) == 0) {
                                printf("%s has disconnected.\n", p->username);
                                remove_client(&active_clients, p->fd);
                            } /* If the command is none of the above, then it is
                            invalid. */
                            else {
                                strncpy(notification, "Invalid command.\r\n", BUF_SIZE);
                            }

                            /* Display success or failure of the command to the
                            user. */
                            display_notification(p, notification, &active_clients);

                            break;
                        }
                    }
                }
            }
        }
    }
    return 0;
}
