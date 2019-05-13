using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class FileDescription
    { 
            public string Name { get; set; }
            public string ContentType { get; set; }
            public long? Size { get; set; }
            public string Extension { get; set; }
            public DateTime UploadDate { get; set; }
    }
}