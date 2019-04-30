using DarkSide;
using System;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models;
using System.Data.SqlTypes;
using System.Web.Mvc;
using System.IO;
using WebApp.Models.Common;

namespace WebApp.Models.Managers
{
    public class ApplicationManager : Manager
    {
        public ApplicationManager(Concrete concrete) : base(concrete) { }
        public IEnumerable<IndexType> SelectAllDepartments()
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<IndexType>(
                    sql: "dbo.SelectAllDepartments",
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public IEnumerable<IndexType> GetReasonsByDepartment(int id)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<IndexType>(
                    sql: "dbo.GetReasonsByDepartment",
                    param: new { DepartmentId = id },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public int SubmitApplication(ApplicationModel application, string uid)
        {
            using (var cnt = Concrete.OpenConnection())
            {

                int Id =  (cnt.Query<int>(
                    sql: "dbo.AddApplication",
                    param: new { UserId = uid, application.Text, application.ReasonId, Longitude = double.Parse(application.Longitude.Replace('.', ',')), Latitude = double.Parse(application.Latitude.Replace('.', ',')) },
                    commandType: CommandType.StoredProcedure
                )).First();

                foreach (UploadFile file in application.Files)
                {
                    FileUpload(file.File.InputStream, file.File.ContentType, Id, Path.GetExtension(file.File.FileName), uid);
                }
                return Id;

            }
        }

        public IEnumerable<FileStreamResult> FileUpload(Stream fileStream,  string contentType,int applicationId, string extension, string userId)
        {

            using (var cnt = Concrete.OpenConnection())
            {
                //try
                //{
                // IEnumerable<FileStreamResult> filestreamResult = cnt.Query<FileStreamResult>(
                return cnt.Query<FileStreamResult>(
                    sql: "UserFileSave",
                    param: new
                    {
                        ApplicationId = applicationId,
                        UserId = userId,
                        contentType = contentType,
                        extension = extension                      
                    },
                    commandType: CommandType.StoredProcedure
                    );
                    
                
                    
                   
                
                    ////try 
                    //{
                    //    using (SqlFileStream sqlFilestream = new SqlFileStream(filestreamResult.FileStreamPath, filestreamResult.FileStreamContext, FileAccess.Write, FileOptions.SequentialScan, 0))
                    //    {
                    //        await fileStream.CopyToAsync(sqlFilestream, 2000);
                    //    }
                    //    trans.Commit();
                    //}
                    ////catch (Exception ex) 
                    ////{ 
                    //// return ex; 
                    ////} 
                    //return filestreamResult.Name;
                //}
                //catch (Exception ex)
                //{
                //    throw ex;
                //};
            }
        }
    }
}



