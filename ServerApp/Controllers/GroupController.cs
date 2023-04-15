using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Data;

namespace ServerApp.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class GroupController 
{
  private readonly IGroupRepository _groupRepository;
    public GroupController(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

  
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Group>>> GetAllGroups()
    {
        var groups = await _groupRepository.GetAllGroupsAsync();
        return new OkObjectResult(groups);
    }


}

}
