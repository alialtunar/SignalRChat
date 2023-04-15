using Microsoft.AspNetCore.Mvc;
using ServerApp.Data;

namespace ServerApp.Controllers
{
[ApiController]
[Route("api/messages")]
public class MessageController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;

    public MessageController(IMessageRepository messageRepository, IUserRepository userRepository)
    {
        _messageRepository = messageRepository;
        _userRepository=userRepository;

    }

    // Get messages between two users
    [HttpGet]
    public IActionResult GetMessages(string senderUserName, string receiverUserName)
    {
        var messages = _messageRepository.GetMessagesBetweenUsers(senderUserName, receiverUserName);

        if (messages == null)
            return NotFound();

        return Ok(messages);
    }

[HttpGet("group/{groupName}")]
public IActionResult GetMessagesFromGroup(string groupName)
{
    var messages = _messageRepository.GetGroupMessages(groupName);

    return Ok(messages);
}


   [HttpGet("last")]
    public IActionResult GetLastMessagesForUser(string userName)
    {
        var conversations = _messageRepository.GetConversationsForUser(userName);
        return Ok(conversations);
    }
   
}

}
