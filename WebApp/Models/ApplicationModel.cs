using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using WebApp.Models.Common;

namespace WebApp.Models
{
    public class ApplicationModel
    {
        [Required]
        public string Title { get; set; }

        public string Text { get; set; }

        public int DepartmentId { get; set; }

        public int ReasonId { get; set; }

        public string Longitude { get; set; }

        public string Latitude { get; set; }



        public UploadFile[] Files { get; set; }
    }
}