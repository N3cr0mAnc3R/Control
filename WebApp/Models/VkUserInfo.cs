using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    [Serializable]
    public class VkUserInfoResponse
    {
        public VkUserInfo[] response { get; set; }


        [Serializable]
        public class VkUserInfo
        {
            
            public string first_name { get; set; }
            public string last_name { get; set; }
            public DateTime bDate1 { get { return DateTime.Parse(bdate); } set {  } }
            public string bdate { get; set; }
        }

    }
}