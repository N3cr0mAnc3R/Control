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
        public IEnumerable<FileStreamResult> GetApplicationImages(int id)
        {
            using (var cnt = Concrete.OpenConnection())
            {
                return cnt.Query<FileStreamResult>(
                    sql: "dbo.GetApplicationImages",
                    param: new { ApplicationId = id },
                    commandType: CommandType.StoredProcedure
                );

            }
        }

        public List<string> GetFileStream(int applicationId)
        {

            //Используется более оптимальный по быстродействию, но пока костыльный подход 
            //когда поток FileStream передаются наружу, для того чтобы прямо из него передавать данные клиенту. 
            //Но для этого нужно держать актуальным подключение к базе и соответственно тут его закрывать нельзя. 

            using (var cnt = Concrete.OpenConnection())
            {


                IDbTransaction trn = cnt.BeginTransaction();
                try
                {
                    //Может быть залезть внутрь и вообще биндинг еще сделать для MvcResultSqlFileStream 
                    IEnumerable<FileStreamDownload> filestreams = cnt.Query<FileStreamDownload>(
                        "dbo.GetApplicationImages",
                        new { ApplicationId = applicationId },
                        trn,
                        commandType: CommandType.StoredProcedure);
                    List<string> imgs = new List<string>();
                    List<MvcResultSqlFileStream> listOfSreams = new List<MvcResultSqlFileStream>();
                    foreach (FileStreamDownload fileStream in filestreams)
                    {
                        MvcResultSqlFileStream stream = new MvcResultSqlFileStream()
                        {
                            Connection = cnt,
                            SqlStream = new SqlFileStream(fileStream.FileStreamPath, fileStream.FileStreamContext, FileAccess.Read),
                            Transaction = trn
                        };
                        byte[] data = new byte[(int)stream.Length];
                        stream.Read(data, 0, data.Length);
                        imgs.Add(Convert.ToBase64String(data));
                        fileStream.Stream = stream;


                    }
                    trn = null;
                    return imgs;
                }
                finally
                {
                    //А вот тут проверяем нужно ли нам освобождать ресурсы или нет 
                    if (null != trn)
                    {
                        trn.Dispose();
                    }
                    if (null != cnt)
                    {
                        cnt.Dispose();
                    }
                }
            }
        }

        public int SubmitApplication(ApplicationModel application, string uid)
        {
            using (var cnt = Concrete.OpenConnection())
            {

                int Id = (cnt.Query<int>(
                    sql: "dbo.AddApplication",
                    param: new {
                                UserId = uid,
                                Text = application.Text,
                                ReasonId = application.ReasonId,
                                Longitude = double.Parse(application.Longitude.Replace('.', ',')),
                                Latitude = double.Parse(application.Latitude.Replace('.', ',')),
                                Title = application.Title
                                },
                    commandType: CommandType.StoredProcedure
                )).First();

                foreach (UploadFile file in application.Files)
                {
                    FileUpload(file.File.InputStream, file.File.ContentType, Id, Path.GetExtension(file.File.FileName), uid, file.File.FileName);
                }
                return Id;

            }
        }
        public string FileUpload(Stream fileStream, string contentType, int applicationId, string extension, string userId, string fileName)
        {
            using (var conn = Concrete.OpenConnection())
            {
                using (IDbTransaction trans = conn.BeginTransaction())
                {
                    try
                    {
                        FileStreamResult filestreamResult = (conn.Query<FileStreamResult>("ApplicationFileSave",
                        new
                        {
                            ApplicationId = applicationId,
                            UserId = userId,
                            contentType = contentType,
                            extension = extension,
                            fileName = fileName
                        }, trans,

                        commandType: CommandType.StoredProcedure)).FirstOrDefault();

                        {
                            using (SqlFileStream sqlFilestream = new SqlFileStream(filestreamResult.FileStreamPath, filestreamResult.FileStreamContext, FileAccess.Write, FileOptions.SequentialScan, 0))
                            {
                                fileStream.CopyTo(sqlFilestream, 2000);
                            }
                            trans.Commit();
                        }
                        return filestreamResult.Name;
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    };
                }
            }
        }
    }
}



