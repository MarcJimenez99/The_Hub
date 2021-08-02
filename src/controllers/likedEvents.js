const User = require('../models/UserSchema.js');
const Room = require('../models/RoomSchema.js');

function getLiked(request, response) {
    response.render(
        'likedEvents',
        {
            title: 'likedEvents'
        }
    );
}

module.exports = {
    getLiked
};