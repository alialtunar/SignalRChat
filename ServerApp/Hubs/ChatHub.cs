using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ServerApp.Data;
using ServerApp.models;
using ServerApp.Models;

[Authorize]
public class ChatHub : Hub
{
    private readonly ChatContext _dbContext;
    private static readonly Dictionary<string, string> ConnectedUsers = new Dictionary<string, string>();

    public ChatHub(ChatContext dbContext)
    {
        _dbContext = dbContext;
    }
public override async Task OnConnectedAsync()
{
    // Get user's UserName and ConnectionId
    var userName = Context.User.Identity.Name;
    var connectionId = Context.ConnectionId;

    if (!string.IsNullOrEmpty(userName))
    {
        // Add user to ConnectedUsers dictionary
        ConnectedUsers[connectionId] = userName;
    }

    Console.WriteLine(userName);

    // Get user's groups from the database
    var userId = Convert.ToInt32(Context.UserIdentifier);
    var userGroups = await _dbContext.GroupUsers
        .Where(gu => gu.UserId == userId)
        .Select(gu => gu.Group.GroupName)
        .ToListAsync();

    // Add user to groups
    foreach (var groupName in userGroups)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    await base.OnConnectedAsync();
}


public override async Task OnDisconnectedAsync(Exception exception)
{
    var connectionId = Context.ConnectionId;
    if (ConnectedUsers.ContainsKey(connectionId))
    {
        ConnectedUsers.Remove(connectionId);
    }
    await base.OnDisconnectedAsync(exception);
}

public async Task SendMessage(string receiverUserName, string message)
{
    // Get sender's UserName and ConnectionId
    var senderUserName = Context.User.FindFirstValue(ClaimTypes.Name);
    var senderConnectionId = Context.ConnectionId;
    var DateSent = DateTime.UtcNow;

    // Get receiver's ConnectionId from ConnectedUsers dictionary
    var receiverConnectionId = ConnectedUsers.FirstOrDefault(x => x.Value == receiverUserName).Key;
    if (receiverConnectionId == null)
    {
        // Receiver not found
        await Clients.Caller.SendAsync("ErrorMessage", $"User {receiverUserName} not found");
        return;
    }

    // Save message to database
    var sender = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == senderUserName);
    var receiver = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == receiverUserName);
    if (sender == null || receiver == null)
    {
        // User not found in database
        await Clients.Caller.SendAsync("ErrorMessage", "User not found in database");
        return;
    }
    var newMessage = new Message
    {
        Text = message,
        DateSent = DateTime.UtcNow,
        SenderId = sender.Id,
        ReceiverId = receiver.Id,
       
    };
    await _dbContext.Messages.AddAsync(newMessage);
    try
    {
        await _dbContext.SaveChangesAsync();
    }
    catch (DbUpdateException )
    {
        // Handle unique constraint violation
        await Clients.Caller.SendAsync("ErrorMessage", "Failed to save message to database");
        return;
    }

    // Send message to receiver
    await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", senderUserName, message,DateSent);
}


    public async Task GetMessages(string receiverUserName)
    {
        var senderUserName = Context.User.FindFirstValue(ClaimTypes.Name);
        var sender = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == senderUserName);
        var receiver = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == receiverUserName);
        if (receiver == null)
        {
            await Clients.Caller.SendAsync("ErrorMessage", $"User {receiverUserName} not found");
            return;
        }

        var messages = await _dbContext.Messages
            .Where(m => (m.SenderId == sender.UserId && m.ReceiverId == receiver.UserId) || (m.SenderId == receiver.UserId && m.ReceiverId == sender.UserId))
            .OrderBy(m => m.DateSent)
            .ToListAsync();

        await Clients.Caller.SendAsync("MessagesLoaded", messages);
    }

     public async Task SendMessageToGroup(string groupName, string message)
    {
        var userId = Convert.ToInt32(Context.UserIdentifier);
      var user = await _dbContext.Users.FindAsync(userId);
      var dateSent = DateTime.UtcNow;


        if (user == null)
        {
            return;
        }

        var group = await _dbContext.Groups
            .Include(g => g.GroupUsers)
            .ThenInclude(gu => gu.User)
            .SingleOrDefaultAsync(g => g.GroupName == groupName);

        if (group == null)
        {
            return;
        }

        var chatMessage = new Message
        {
            Text = message,
            DateSent = DateTime.Now,
            Sender = user,
            Group = group
        };

        _dbContext.Messages.Add(chatMessage);
        await _dbContext.SaveChangesAsync();

        await Clients.OthersInGroup(groupName).SendAsync("ReceiveMessageGroup", user.FullName, message,dateSent);
    }

public async Task JoinGroup(string groupName)
{
    var userId = Convert.ToInt32(Context.UserIdentifier);
    var user = await _dbContext.Users.FindAsync(userId);

    if (user == null)
    {
        return;
    }

    var group = await _dbContext.Groups.SingleOrDefaultAsync(g => g.GroupName == groupName);

    if (group == null)
    {
        return;
    }

    var existingGroupUser = await _dbContext.GroupUsers
        .SingleOrDefaultAsync(gu => gu.GroupId == group.GroupId && gu.UserId == user.UserId);

    if (existingGroupUser != null)
    {
        await Clients.Caller.SendAsync("ErrorMessage", "You are already a member of this group.");
        return;
    }

    var groupUser = new GroupUser
    {
        Group = group,
        User = user
    };

    _dbContext.GroupUsers.Add(groupUser);
    await _dbContext.SaveChangesAsync();

    await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    await Clients.Group(groupName).SendAsync("UserJoined", user.FullName);
}

public async Task LeaveGroup(string groupName)
{
    var user = await _dbContext.Users.FindAsync(Context.UserIdentifier);

    if (user == null)
    {
        return;
    }

    var group = await _dbContext.Groups.SingleOrDefaultAsync(g => g.GroupName == groupName);

    if (group == null)
    {
        return;
    }

    var groupUser = await _dbContext.GroupUsers
        .SingleOrDefaultAsync(gu => gu.GroupId == group.GroupId && gu.UserId == user.UserId);

    if (groupUser == null)
    {
        return;
    }

    _dbContext.GroupUsers.Remove(groupUser);
    await _dbContext.SaveChangesAsync();

    await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    await Clients.Group(groupName).SendAsync("UserLeft", user.FullName);
}




}
