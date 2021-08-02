const User = require('../models/UserSchema');

function getProfile(request, response) {
    response.render(
        'editProfile',
        {
            title: 'editProfile'
        }
    );
}

module.exports = {
    getProfile
};