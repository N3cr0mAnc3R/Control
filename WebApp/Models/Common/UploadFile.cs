using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models.Common
{
    public class UploadFile
    {
        public Guid FileId { get; set; }
        [FileTypes("jpg,jpeg,gif,png")]
            public HttpPostedFileBase File { get; set; }

    }
}