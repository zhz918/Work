# Team 19 Once Upon A Time

## Running The App

The app is deployed on Heroku.

https://onceuponatime-309.herokuapp.com/


## Running The App Locally

To run the app locally, follow these steps.

1. Open a terminal window and run "git clone https://github.com/csc309-winter-2021/team19.git".
2. Run "cd &lt;path to the team19 folder&gt;".
3. Start your local Mongo database.  For example, in a separate terminal window:
   mkdir mongo-data
   mongod --dbpath mongo-data
4. Run "npm run setup" in the root directory.
5. Run "npm run build-run" in the root directory.

Use http://localhost:3000/ to open the app in the browser.

## Logging In

There are two types of users: regular users and admins.

Users can signup for a regular user account.

We have provided the following credentials for regular user and admins:
To log in with regular user privileges, use the following credentials:

Username: user    
Password: user

OR        

Username: user2   
Password: user2

To log in with admin privileges, use the following credentials:

Username: admin   
Password: admin

## Features

The features will be divided based on the page they are on. Note that admin has all the general user functionalities, as well as its own features.

### Home Page

#### Regular User

Users can sort stories by the number of likes, dates, or the number of follow-ups.

Users can search a story in the search bar with the story name.

Each of the cards contains the basic information of a story, including the title, an image, the starting sentence of the story, and statistics. The statistics are

<img src="./client/src/components/images/followups-icon.png" width=30> : the number of contributions to a story, which includes the original post and all followups.  

<img src="./client/src/components/images/contributors-icon.png" width=30> : the number of unique users who made a contribution to the story.    

<img src="./client/src/components/images/likes-icon.png" width=30> : the number of users who liked the story.

To join a story, tap on the card, which will take you to the story follow-up page.

##### Admin

Clicking on the "delete" button at the top right of the card will remove the card from the home page.

### Story Followup Page (When clicked inside a story)

#### Regular User

On this page, users can view a story in more details, including its original details, contributor, and posting date. Users can then choose one of the two options provided to continue the story. If there is a followup for that option, the user will be linked to it. Otherwise, users will be linked to the story editing page.

Users can click on the "like" button inside a post to leave a like to the story. Click on the "like" button again to unlike the story. Clicking on the author's name will lead you to their profile page.

##### Admin

Clicking on the "delete" button inside a story card will delete the following contents from that story.

### Story Editing Page

After clicking an option of a story with no follow-up, the user will be able to add a follow-up by adding the details to the "new content" section and adding two options that readers can choose to do after their follow-up. Clicking the "post" button will add the follow-up to the story.

### Add Story Page

Users can add a new story by using this page. The required details are the story title and story content, the two option boxes to give a viewer of the story a choice to make after their starting story details, as well as an image of the story section.

### Profile Page

Users have a profile picture and a series of statistics, including contributions, points, join date, and level. Contributions are the number of posts and follow-ups the user made. Points are earned through making contributions and follow-ups. Users start at level 1 and can increase their level in the shop.

The "currently involved" section contains cards to stories that the user-contributed to it.

The "Liked Stories" section contains cards to stories that the user liked.

Click onto any card in the above section will redirect the user to the story.

### Rank Page

This page lists the top users based on their level, contributions, or points earned. The list criteria can be changed using the buttons on the top. Clicking on a username will lead you to their profile page.

### Shop Page

#### Regular User

Users can purchase products using the points they earned. The cost of the item is at the bottom of each item and clicking on an item will purchase it if the user has sufficient points.

##### Admin

Admin can purchase products in the shop. Also, admin can add/remove products/sections. By pressing the "Add Product/Section" button, users can decide to add a new section or a new product. To add a new section, an admin needs to type in the name and its description and click confirm. To add a new product, name/image/points/level/type/section are needed to confirm the addition. Lastly, admin can also delete a product or a section by pressing the "Remove Product/Section" button on the shop page. Clicking on a product will delete it, and clicking the delete button beside the section name will delete that section and all the products in it.

### Logout

The current user will be redirected to the Login page after they click on the logout button.

## Server/Database/Routes

We used React frontend with Express backend and MongoDB.

Routes are separated into productRoutes.js, storyRoutes.js, and userRoutes.js inside the routes folder.

### Product Routes

#### POST '/api/shop/section'
Add new inventory section.   
Request body expects JSON:    
```
{
    "name": <section name>,   
    "description": <section description>  
}
```
Returned JSON should be the new ProductSection document.

#### POST '/api/shop/product/:sname'
Add new product to same inventory section.   
Request body expects form-data:   
```
{
    "name": <new product name>, (String)
    "points": <cost of new product>, (Number)
    "type": "Avatar" or "Level",
    "img": <file> (only accept .jpeg, .jpg, .png),
    "value": <value of the product> (Number)
}
```
Returned JSON should be the updated product section document name &lt;sname&gt;.

#### GET '/api/shop/sections'
Get all shop section name.   
Request body empty, return a list of product section name in the database.

#### DELETE '/api/shop/sections/:sname'
Delete shop product section with name &lt;sname&gt;.    
Return list of all other ProductSection docement.

#### DELETE '/api/shop/product/:id'
Delete shop product by id.

#### GET '/api/allInventory'
Get All product section with subdocument products in the database.

#### PATCH '/api/shop/:id'
Buy item, deduct the points of product by product id from current user. Successful if user has enough points.   
Update current user document base of type of product.   
Return:
```
{
    'success': Boolean
}
```

### Story Routes

#### POST '/api/addStory'
Add new story.    
Request body expects form-data:
```
{
    "title": <story name>,
    "content": <first node content>,
    "op1": <first node option 1>,
    "op2": <first node option 2>,
    "img": <file> (only accept .jpeg, .jpg, .png)
}
```
Returned JSON should be the new Story document added to database.

#### GET '/api/allStory'
Get list of all stories.    
Request body is empty   .
Returned JSON should be the list of all Story document in the database.

#### GET '/api/storyContribute'
Get list of stories contributed by current user.    
Request body is empty.    
Returned JSON should be the list of Story document in the database with current user contribution.

#### GET '/api/storyLikes'
Get list of stories liked by current user   
Request body is empty.    
Returned JSON should be the list of Story document in the database liked by current user.   

#### GET '/api/story/:id'
Get story by id, return the Story document.

#### DELETE '/api/story/:id'
Delete a story by id from database.

#### PATCH '/api/story/likes/:id'
Update likes list in story with corresponding id and add the story with corresponding id to the like list for current user.   
Request body expects the updated Story document.    

#### PATCH '/api/story/:id/:nid'
Update node nid in story id with new information.     
Request body expects form-data:   
```
{
    "content": <new story content>,
    "op1": <node option 1>,
    "op2": <node option 2>,
    "img": <file> (only accept .jpeg, .jpg, .png)
}
```
Returned JSON should have the updated Story id document and the node nid subdocument:   
```
{ "story": <story document>, "node": <node subdocument>}
```

#### DELETE '/api/story/nodes/:id/'
Delete nodes in story id.   
Request body expects a list of id of nodes in story id.   
Returned JSON should be the update story document.

#### PATCH '/api/story/nodes/:id/:nid'
Clear all field in node nid in story id, set follows: false.    
No request body.    
Returned JSON should have the updated Story id document and the node nid subdocument:   
```
{ "story": <story document>, "node": <node subdocument>}
```

### User Routes

#### POST '/user/login'
A route to login and create a session   
Request body expects JSON:    
```
{
    "username": <user username>
    "password": <user password>
}
```
Returned JSON should be:
```
{
    "currentUser": <user username>
}
```

#### GET "/user/logout"
A route to logout a user.   
Both request & response body is empty.

#### GET '/user/check-session'
A route to check if a user is logged in on the session. Request body is empty.    
If there is a user logged in: returned JSON should be:
```
{
    "currentUser": <user username>
}
```
else send error 401.

#### POST '/api/register'
Registers a user.  
Request body expects JSON:
```
{
    "username": <new user username>
    "password": <new user password>
}
```
Returned JSON should be the new User document added to database, with type user.

#### post '/api/admin'
Registers an admin.  
Request body expects JSON:    
```   
{
    "username": <new admin username>
    "password": <new admin password>
}
```
Returned JSON should be the new User document added to database, with type admin.

#### GET "/user/type"
Checks User Type (admin: true/false).
Request body is empty.
Returned JSON should be:    
```
{
    "type": Boolean
}
```
depends on user type (admin/user)   

#### GET '/api/user'
Get current user info.
Request body is empty.
Returned the document of current user, expect password.

#### GET '/api/user/avatar/:username'
Get userAvatar image by username.
Request body is empty, with params username.
Returned the avatar of user with username username.   
```
{
    "data": {
        "type": "Buffer",
        "data": [<Buffer>]
    },
    "contentType": <file type>
}
```

Note that routes descriptions are also commented in the js file.
