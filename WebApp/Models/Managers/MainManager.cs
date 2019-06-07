using Dapper;
using DarkSide;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;


namespace WebApp.Models.Managers
{
    public class MainManager : Manager
    {
        public MainManager(Concrete concrete) : base(concrete) { }

        public IEnumerable<ApplicationModel> GetApplicationsWithCoords()
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<ApplicationModel>(
                    sql: "dbo.GetApplicationsWithCoords",
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public IEnumerable<ApplicationModel> GetTopApplications()
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<ApplicationModel>(
                    sql: "dbo.GetTopApplications",
                    commandType: CommandType.StoredProcedure
                );

            }
        }
    }
}