using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace ServerApp.models
{
    public class User:IdentityUser<int>
    {
    public int UserId { get; set; }
    
    public ICollection<Message> ReceivedMessages { get; set; }
    public ICollection<GroupUser> GroupUsers { get; set; }
    }
}