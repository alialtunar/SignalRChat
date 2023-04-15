using System.Collections.Generic;

using System.Threading.Tasks;
using ServerApp.DTO;
using ServerApp.models;

namespace ServerApp.Data
{
    public interface IGroupRepository
    {
        public Task<IEnumerable<GroupListDto>> GetAllGroupsAsync();
    }
}