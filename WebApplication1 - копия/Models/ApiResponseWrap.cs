using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class ApiResponseWrap
    {
        public enum ResponseState
        {
            Success,
            Error
        }
        public enum MessageType
        {
            Success,
            Error
        }
        public class Message
        {
            [JsonConverter(typeof(StringEnumConverter))]
            public MessageType Type { get; set; }
            public string Body { get; set; }

            public Message(MessageType type, string body)
            {
                Type = type;
                Body = body;
            }
        }
        [JsonConverter(typeof(StringEnumConverter))]
        public ResponseState State{ get; set; }
        public object Data { get; set; }
        public IEnumerable<Message> Messages { get; set; }
        public ApiResponseWrap(ResponseState state, object data): this(state, data, new Message[0]){}

        public ApiResponseWrap(ResponseState state, object data, IEnumerable<Message> messages)
        {
            State = state;
            Data = data;
            Messages = messages;
        }
    }
}