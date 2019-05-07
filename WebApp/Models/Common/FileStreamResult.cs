using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models.Common
{
    public class FileStreamResult
    {
        public string FileStreamPath { get; set; }
        public byte[] FileStreamContext { get; set; }
        public string Name { get; set; }
    }
}