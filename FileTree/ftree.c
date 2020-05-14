#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <dirent.h>
// Add your system includes here.

#include "ftree.h"
#include <sys/types.h>
#include <sys/stat.h>

/* This helper function takes a file path and file name that can be extended
from the path. It constructs the node corresponding to that filename */
struct TreeNode *generate_ftree_helper(char *fname, char *path) {
    // The node to be constructed this call
    struct TreeNode *node = malloc(sizeof(struct TreeNode));

    if (node == NULL) {
        perror("malloc");
        fprintf(stderr, "Node memory for (%s/%s) could not be allocated", fname, path);
        exit(1);
    }

    // Assign the node name using either the input path or filename, the initial
    // call to this helper should take the input path
    if (strlen(path) == 0) {
        // This memory is freed in deallocate_ftree
        node->fname = malloc(strlen(fname) + 1);
        if (node->fname == NULL) {
            perror("malloc");
            fprintf(stderr, "Node name memory for (%s/%s) could not be allocated", fname, path);
            exit(1);
        }
        strncpy(node->fname, fname, strlen(fname));
        (node->fname)[strlen(fname)] = '\0';
    } // All other calls use the filename input
    else {
        // This memory is freed in deallocate_ftree
        node->fname = malloc(strlen(path) + 1);
        if (node->fname == NULL) {
            perror("malloc");
            fprintf(stderr, "Node name memory for (%s/%s) could not be allocated", fname, path);
            exit(1);
        }
        strncpy(node->fname, path, strlen(path));
        (node->fname)[strlen(path)] = '\0';
        // Concatenate the filename to the input path to locate the node
        // for this call
        strcat(fname, "/");
        strcat(fname, path);
    }

    struct stat info;

    // If the lstat call fails, the file does not exist
    if (lstat(fname, &info) == -1) {
        perror("lstat");
        fprintf(stderr, "The path (%s) does not point to an existing entry!\n", fname);
        exit(1);
    }

    node->permissions = info.st_mode & 0777;
    // The only time the "contents" attribute changes is for a non-empty
    // directory
    node->contents = NULL;
    // The only time the "next" attribute changes is if this file is in a
    // directory with at least two files
    node->next = NULL;

    // The three types of files are regular tiles, links, and directories.
    if (S_ISREG(info.st_mode)) {
        node->type = '-';
    } else if (S_ISLNK(info.st_mode)) {
        node->type = 'l';
    } // The file must be a directory in this last case so this function will be
    // recursively called on all files inside the directory
    else {
        node->type = 'd';

        // Open the directory stream
        DIR *dir_ptr = opendir(fname);

        if (dir_ptr == NULL) {
            perror("opendir");
            fprintf(stderr, "Directory stream for (%s) could not be opened", fname);
            exit(1);
        }

        // These TreeNode objects maintain adjacent files to build a linked list
        // for the "contents" attribute
        struct TreeNode *curr_node;
        struct TreeNode *prev_node = NULL;
        // Read the first file in the directory
        struct dirent *ent_ptr = readdir(dir_ptr);
        // If the file read is first, then it is the head of the linked list.
        int first = 1;

        // This will be a copy of the original "fname" extended with "path"
        // to ensure that calls to directory files are independent, the maximum
        // file path length is 260 characters
        char fname_dup[260];
        // Loop while there are still unread files in the directory
        while(ent_ptr != NULL) {
            // Skip the file if it begins with '.'
            if ((ent_ptr->d_name)[0] == '.') {
                ent_ptr = readdir(dir_ptr);
                continue;
            }
            // Create a copy of fname to be used in the recursive call
            strncpy(fname_dup, fname, strlen(fname));
            fname_dup[strlen(fname)] = '\0';
            // Generate node for this file
            curr_node = generate_ftree_helper(fname_dup, ent_ptr->d_name);
            // If this is the first file, it is not the "next" attribute of any
            // node
            if (first == 1) {
                node->contents = curr_node;
                first = 0;
            } // Otherwise, link this node to the one before
            else {
                prev_node->next = curr_node;
            }
            // Updates for next iteration
            prev_node = curr_node;
            ent_ptr = readdir(dir_ptr);
        }
        //The final node has no node to link to its front
        if (prev_node != NULL) {
            prev_node->next = NULL;
        }

        if (closedir(dir_ptr) == -1) {
            perror("closedir");
            fprintf(stderr, "Directory stream for (%s) could not be closed", fname);
            exit(1);
        }
    }

    return node;
}


/*
 * Returns the FTree rooted at the path fname.
 *
 * Use the following if the file fname doesn't exist and return NULL:
 * fprintf(stderr, "The path (%s) does not point to an existing entry!\n", fname);
 *
 */
struct TreeNode *generate_ftree(const char *fname) {

    // Your implementation here.

    // Hint: consider implementing a recursive helper function that
    // takes fname and a path.  For the initial call on the
    // helper function, the path would be "", since fname is the root
    // of the FTree.  For files at other depths, the path would be the
    // file path from the root to that file.

    // Non-constant version of fname that can be used with string functions
    char* fname_v = (char *) fname;
    return generate_ftree_helper(fname_v, "");
}


/*
 * Prints the TreeNodes encountered on a preorder traversal of an FTree.
 *
 * The only print statements that you may use in this function are:
 * printf("===== %s (%c%o) =====\n", root->fname, root->type, root->permissions)
 * printf("%s (%c%o)\n", root->fname, root->type, root->permissions)
 *
 */
void print_ftree(struct TreeNode *root) {

    // Here's a trick for remembering what depth (in the tree) you're at
    // and printing 2 * that many spaces at the beginning of the line.
    static int depth = 0;
    printf("%*s", depth * 2, "");

    // Your implementation here.

    // If node is not a directory, no more processing is needed after printing
    // out its information
    if (root->type != 'd') {
        printf("%s (%c%o)\n", root->fname, root->type, root->permissions);
    } // Otherwise, print out the directory information and that of all of its
    // files
    else {
        printf("===== %s (%c%o) =====\n", root->fname, root->type, root->permissions);
        // Files in directory are indented
        depth++;
        // Print information for each node in linked list
        struct TreeNode *curr_node = root->contents;
        while (curr_node != NULL) {
            print_ftree(curr_node);
            curr_node = curr_node->next;
        }
        // File level returns to that of the directory
        depth--;
    }


}


/*
 * Deallocate all dynamically-allocated memory in the FTree rooted at node.
 *
 */
void deallocate_ftree (struct TreeNode *node) {

   // Your implementation here.

   // "fname" attribute of all nodes was allocated for it to be assigned
   free(node->fname);
   free(node);
   // Deallocate all nodes inside the a directory, or skip if input is not a
   // directory
   struct TreeNode *curr_node = node->contents;
   while (curr_node != NULL) {
       deallocate_ftree(curr_node);
       curr_node = curr_node->next;
   }

}
