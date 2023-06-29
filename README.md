# Productimer
A productivity app that keeps you accountable with your friends.


For the frontend, EJS, CSS, and JS, jQuery roundSlider are utilized to deliver a seamless user experience.
\
\
The backend employed in this project encompasses MongoDB for the database, along with Node.js and Express for the backend.

We have used socket.io for the realtime rooms feature so that you can create a common session with your friends from anywhere in the world!

# How to use:
- The app works in two fundamental modes:
    - ## Local(solo) mode
        1. This mode is activated when you do not join any room or whenever you refresh the page.
        2. Here you can start your session and use the timer as a regular pomodoro/ productivity timer.

    - ## Collaborative mode
       1. This mode gets activated whenever you join a room with a room ID.(any id that has not been used yet, makes you the owner for that ID)
       2. The room ID can be any string

       3. The first person who joins the room becomes the permanent ***owner***  of that room. Only one owner can exist per room.
       

        The subsequent members who join the room(**even after the owner has left**) become the ***members*** of that room.

        ### Owner Abilities:
        - Start the session (plant) with desired duration of the session.
        - Stop the session globally (kill).
        - Session can only be started by the owner for a given room.
         ### Member Abilities:
        - Stop the session globally (kill).

### Note:
- If someone closes/refreshes their browser tab during a session, it would not affect the other members' session in the same room i.e. it wont kill. It will remove particular person from the room and the time won't be synced for members who join after the session has started or when they leave/abort their session(without killing).
- However if someone(member/owner) clicks the kill button, the session will stop for everyone in the room, and the display name of the killer will be displayed to all the members in that room.
        

#### Upon successful completion of any global or local session, the data of the successful session will be stored in the database and can be seen in the Stats page.

        



# How to setup locally

## Make sure you have these Dependencies installed:
- [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/)
- [Node.js](https://nodejs.org/en/download)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass)(optional)

## Installation

-  First clone this repo

```bash
git clone https://github.com/apoorvapendse/productimer.git
cd productimer
```
- Now install the required dependencies using npm
```bash
npm i 
```
- Now enter the command below to start the server 
```bash
node index.js
```
- You can access the website once the server starts and database is connected  on *localhost:4400*
