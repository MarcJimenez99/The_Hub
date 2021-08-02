// Controller handler to handle functionality in room page

const roomGenerator = require('../util/roomIdGenerator.js');
const Room = require('../models/RoomSchema.js');
const Message = require('../models/MessageSchema');
// Example for handle a get request at '/:roomName' endpoint.

function getRoom(request, response) {
	Room.findOne({ name: request.params.roomName }).lean().then(room => {
		response.render(
			'room', 
			{	title: 'chatroom', 
				roomName: room.name, 
				roomID: room.roomID,
				description: room.description,
				upvote: room.upvote,
				arr_upvote: room.arr_upvote,
				arr_seenMessages: room.arr_seenMessages,
				arr_createdMessages: room.arr_createdMessages,
				owner: room.owner
			}
		);
	})
	.catch(e => {
		console.log("Error: Room not found");
	});
}
	
module.exports = {
    getRoom
};