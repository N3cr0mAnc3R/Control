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

        public bool CheckAccess(int Id, string UserId)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<bool>(
                    sql: "dbo.CheckAccess",
                    param: new
                    {
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
        public dynamic SelectCommentsByApplicationId(int ApplicationId, int Offset)
        {

            using (var cnt = Concrete.OpenConnection())
            {
                List<CommentModel> comments;
                int commentNumber;
                using (var multi = cnt.QueryMultiple(
                      sql: "dbo.Select5CommentsByApplicationId",
                      param: new
                      {
                          ApplicationId,
                          Offset 
                      },
                      commandType: CommandType.StoredProcedure
                  ))
                {
                    comments = multi.Read<CommentModel>().ToList();
                    commentNumber = multi.Read<int>().First();
                }
                return new
                {
                    Comments = comments,
                    CommentNumber = commentNumber
                };
            }
        }
        public void AddComment(string UserId, int ApplicationId, string Text, int? ParentCommentId)
        {

            using (var cnt = Concrete.OpenConnection())
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

        public void DeleteApplication(int ApplicationId)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                cnt.Execute(
                    sql: "dbo.DeleteApplication",
                    param: new { ApplicationId },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public void ChangeApplicationText(int ApplicationId, string Text)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                cnt.Execute(
                    sql: "dbo.ChangeApplicationText",
                    param: new { ApplicationId, Text },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

    }
}