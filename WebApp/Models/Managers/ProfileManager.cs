using DarkSide;
using System;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models;
using WebApp.Models.News;

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
        public List<CommentModel> SelectCommentsByApplicationId(int ApplicationId)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<CommentModel>(
                    sql: "dbo.SelectCommentsByApplicationId",
                    param: new
                    {
                        ApplicationId
                    },
                    commandType: CommandType.StoredProcedure
                ).ToList();

            }
        }
        public void AddComment( string UserId,int ApplicationId,string Text,int? ParentCommentId)
        {

            using (var cnt =  Concrete.OpenConnection())
            {
                 cnt.Execute(
                     sql: "AddComment",
                     commandType: CommandType.StoredProcedure,
                      param: new
                      {
                          UserId,
                          ApplicationId,
                          Text,
                          ParentCommentId
                      }
                     );
            }

        }

    }
}