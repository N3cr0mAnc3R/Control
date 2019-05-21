using Dapper;
using DarkSide;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace WebApp.Models.Managers
{
    public class AccountManager : Manager
    {
        public AccountManager(Concrete concrete) : base(concrete) { }

        public void AddNewUser(string id)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                cnt.Execute(
                    sql: "dbo.AddNewUser",
                    param: new { UserId = id },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public void AddThirdPartyAuth(string userId, string thirdPartyId, string provider)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                cnt.Execute(
                    sql: "dbo.AddThirdPartyAuth",
                    param: new { ThirdPartyId = thirdPartyId, UserId = userId, Provider = provider },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public string GetUserIdFromThirdPartyAuth(string thirdPartyId, string provider)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<Guid>(
                    sql: "dbo.GetUserIdFromThirdPartyAuth",
                    param: new { ThirdPartyId = thirdPartyId, Provider = provider },
                    commandType: CommandType.StoredProcedure
                ).FirstOrDefault().ToString();

            }
        }
    }
}