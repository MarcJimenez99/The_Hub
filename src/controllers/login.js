const Users = require('../models/UserSchema');

function getLogin(request, response) {
    response.render(
        'login',
        {
            title: 'login',
        }
    );
}

function getRegistrar(request, response) {
    response.render(
        'register',
        {
            title: 'register'
        }
    );
}

module.exports = {
    getLogin,
    getRegistrar
};
//
