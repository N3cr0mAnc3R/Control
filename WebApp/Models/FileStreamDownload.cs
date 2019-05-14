using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApp.Models.Common;

namespace WebApp.Models
{
    public class FileStreamDownload : FileStreamResult, IDisposable
    {
        public MvcResultSqlFileStream Stream { get; set; }

        public void Dispose()
        {
            Stream.Dispose();
        }
    }
}