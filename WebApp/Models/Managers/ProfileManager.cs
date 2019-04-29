using DarkSide;
using System;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models;


namespace WebApp.Models.Managers
{
    public class ProfileManager : Manager
    {
        public ProfileManager(Concrete concrete) : base(concrete) { }

        public bool CheckAccess(int Id,string UserId)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<bool>(
                    sql: "dbo.CheckAccess",
                    param: new {
                        Id,
                        UserId
                    },
                    commandType: CommandType.StoredProcedure
                ).First();

            }
        }
        public List<ApplicationModel> SelectApplicationsByUserId(string UserId)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<ApplicationModel>(
                    sql: "dbo.SelectApplicationsByUserId",
                    param: new
                    {
                        UserId
                    },
                    commandType: CommandType.StoredProcedure
                ).ToList();

            }
        }

    }
}