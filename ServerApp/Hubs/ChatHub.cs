using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ServerApp.Data;
using ServerApp.models;

public class ChatHub : Hub
{
    private readonly DbContextOptions<ChatContext> _dbContextOptions;

    public ChatHub(DbContextOptions<ChatContext> dbContextOptions)
    {
        _dbContextOptions = dbContextOptions;
    }

    public async Task JoinGroup(int groupId)
    {
        var group = await GetGroupById(groupId);
        if (group != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId.ToString());
            await Clients.Caller.SendAsync("JoinGroup", group);
            await Clients.Group(groupId.ToString()).SendAsync("GroupJoined", $"{Context.User.Identity.Name} joined the group");
        }
    }

    public async Task LeaveGroup(int groupId)
    {
        var group = await GetGroupById(groupId);
        if (group != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId.ToString());
            await Clients.Caller.SendAsync("LeaveGroup", group);
            await Clients.Group(groupId.ToString()).SendAsync("GroupLeft", $"{Context.User.Identity.Name} left the group");
        }
    }

    public async Task SendMessage(int groupId, string message)
    {
        var group = await GetGroupById(groupId);
        if (group != null)
        {
            var senderId = int.Parse(Context.UserIdentifier);
            var newMessage = new Message
            {
                Text = message,
                DateSent = DateTime.UtcNow,
                SenderId = senderId,
                GroupId = groupId
            };

            using var dbContext = new ChatContext(_dbContextOptions);
            dbContext.Messages.Add(newMessage);
            await dbContext.SaveChangesAsync();

            await Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", newMessage);
        }
    }

    public async Task GetMessages(int groupId)
    {
        using var dbContext = new ChatContext(_dbContextOptions);
        var messages = await dbContext.Messages
            .Include(m => m.Sender)
            .Where(m => m.GroupId == groupId)
            .OrderBy(m => m.DateSent)
            .ToListAsync();

        await Clients.Caller.SendAsync("ReceiveMessages", messages);
    }

    private async Task<Group> GetGroupById(int groupId)
    {
        using var dbContext = new ChatContext(_dbContextOptions);
        return await dbContext.Groups.FindAsync(groupId);
    }
}
