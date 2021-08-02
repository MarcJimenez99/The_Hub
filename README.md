# Project Team Name: the Hub
## Members: Kinjal Mugatwala, Neha Gupta, Marc Jimenez

### How to run the program:
- Locally
    - CD into src folder from main project folder
    - node/nodemon server.js  
    - Access via localhost:3000
- Heroku Deployment:
    - https://finalprojectthehub.herokuapp.com/ (Unstable launch may still have some issues with bugs)

### Tools Utilized:
- Front-end: HTML5, CSS3, JavaScript, JQuery
- Back-end: NodeJS/Express, MongoDB, Passport.js


### Main Features:

#### User Authentication & Authorization (log in, password protection & encryption):
- User is immediately redirected to the login page and user can can create a new account by clicking on "register now" link.
- Makes use of Passport.js for authentication and Bcrypt to encrypt passwords.
- Users who enter invalid information or duplicate information will render an error on their screen telling them what input prevented the log-in
- Users cannot visit any other part of website without logging in (/login page instead of /admin).

#### Profiling Features (edit profile page):
- Users can edit pre-existing information such as their email and name. In addition they’re able to enter more personal information such as address and age.
- Users who enter invalid information or duplicate information will render an error on their screen telling them what input prevented the edit

#### Social Network/Rating/Commenting System:
- Each room represents a page of interaction for each individual event. User can send message to chat board and share any comments/reviews/questions they have about the event. 
- Created an upvoting/liking system where users can "upvote" an event they find interesting. This system also allows for all users understand which events seem more popular and highly reviewed.

#### Database:
- Utilized MongoDB 
- Created 3 Mongoose Schemas (found under models folder):
    - RoomSchema: contains information about each event. A room represents an event.
    - MessageSchema: contains information about messages sent under a specific event/room.
    - UserSchema: contains information about each registered user.

#### Search & Recommendation:
- Search:
    - Can search for a specific event on the home page based on description, event name, and category.
    - In each event room, users can search for a particular message based on message content.
- Recommendation:
    - Users can see how many "likes" were given to each event and events with more "likes" mean that those events are highly recommended by more users.

#### Admin & Additional Features:
- Edit Message: When the user clicks on the edit button, they can click on the message and an edit bar shows up for them to change their message. After pressing “enter”, the new message saves and gets updated in the database. Users can only edit their own message.
- Delete Message: The user can also delete the message after pressing the delete button.
- Navigation Bar: Allows the user to navigate throughout the site much more easily. The three pages under navigation are home page, user's liked events, and an edit profile page.
- "Your Liked Events": Users can visit this page (found under menu navigation bar) to see the events they liked. This features allows a quick access to the pages user liked to filter from the rest of the events.


##### Challenges: 
- With the edit and delete functionality figuring out how to make the content editable and saving the new message was a challenge. The delete functionality has a rare glitch which sometimes leads to viewing the message twice before it deletes completely. 

- Neha's message: An issue I had was with Visual Studios it wouldn’t allow me to see my partners’ code at times and I would have to delete the repo and start again which led to challenges in committing to Github.


