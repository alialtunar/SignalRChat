using System.Collections.Generic;
using ServerApp.DTO;
using ServerApp.models;

namespace ServerApp.Data
{
    public interface IMessageRepository
    {
   List<object> GetMessagesBetweenUsers(string senderUserName, string receiverUserName);

    List<ConversationDto> GetConversationsForUser(string userName);

    public List<object> GetGroupMessages(string groupName);


    }
}