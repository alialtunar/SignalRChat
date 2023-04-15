using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ServerApp.DTO;
using ServerApp.models;

namespace ServerApp.Data
{
public class MessageRepository : IMessageRepository
{
    private readonly ChatContext _context;

    public MessageRepository(ChatContext context)
    {
        _context = context;
    }

public List<object> GetMessagesBetweenUsers(string senderUserName, string receiverUserName)
{
    var messages = _context.Messages
        .Where(m => m.Sender.UserName == senderUserName && m.Receiver.UserName == receiverUserName
                || m.Sender.UserName == receiverUserName && m.Receiver.UserName == senderUserName)
        .OrderBy(m => m.DateSent)
        .Select(m => new {
            Text = m.Text,
            DateSent = m.DateSent,
            SenderUserName = m.Sender.UserName,
            SenderFullName = m.Sender.FullName,
            Type = (m.Sender.UserName == senderUserName) ? 1 : 0
        })
        .ToList<object>();

    return messages;
}

public List<object> GetGroupMessages(string groupName)
{
    var messages = _context.Messages
        .Where(m => m.Group.GroupName == groupName)
        .OrderBy(m => m.DateSent)
        .Select(m => new {
            Text = m.Text,
            DateSent = m.DateSent,
            SenderUserName = m.Sender.UserName,
            SenderFullName = m.Sender.FullName

        })
        .ToList<object>();

    return messages;
}



public List<ConversationDto> GetConversationsForUser(string userName)
{
var conversations = new List<ConversationDto>();
var user = _context.Users
    .Include(u => u.ReceivedMessages)
    .ThenInclude(m => m.Sender)
    .SingleOrDefault(u => u.UserName == userName);

if (user == null)
{
    return conversations;
}

var messages = user.ReceivedMessages.OrderByDescending(m => m.DateSent).ToList();
var contacts = messages.GroupBy(m => m.Sender).ToList();

foreach (var contact in contacts)
{
    var lastMessage = contact.FirstOrDefault();

    var conversation = new ConversationDto
    {
         userImg = lastMessage.Sender.userImg,
        ContactName = lastMessage.Sender.UserName,
        LastMessage = lastMessage.Text,
        LastMessageDate = lastMessage.DateSent,
        fullName = lastMessage.Sender.FullName
    };

    conversations.Add(conversation);
}

return conversations;
}

   
}
}