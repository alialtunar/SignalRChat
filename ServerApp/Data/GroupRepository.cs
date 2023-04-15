using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ServerApp.DTO;
using ServerApp.models;

namespace ServerApp.Data
{
public class GroupRepository : IGroupRepository
{
    private readonly ChatContext _context;

    public GroupRepository(ChatContext context)
    {
        _context = context;
    }

       public async Task<IEnumerable<GroupListDto>> GetAllGroupsAsync()
{
    return await _context.Set<Group>()
                                .Select(g => new GroupListDto { GroupId = g.GroupId, GroupName = g.GroupName })
                                .ToListAsync();
}

    }
}