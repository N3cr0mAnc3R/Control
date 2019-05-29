using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    [Serializable]
    public class VkUserInfoResponse
    {
        public VkUserInfo response { get; set; }


        [Serializable]
        public class VkUserInfo
        {
            public string Email { get; set; }
            public string first_name { get; set; }
            public string last_name { get; set; }
            public DateTime bdate { get; set; }
        }


    }
}