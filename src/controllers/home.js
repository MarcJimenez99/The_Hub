const Room = require('../models/RoomSchema');
// Controller handler to handle functionality in home page

// Example for handle a get request at '/' endpoint.


function getHome(request, response){
  // do any work you need to do, then
  Room.find().lean().then(items =>
    {
      response.render(
        'home', 
        { title: 'home', 
          rooms: items, 
        }
      );
    })
}


module.exports = {
    getHome,
};

