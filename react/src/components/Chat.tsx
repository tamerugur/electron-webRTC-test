interface voiceChatProps {
  chatHeight: string;
  chatWidth: string;
}

function Chat(props: voiceChatProps) {
return (
    <div
        style={{
            height: props.chatHeight,
            width: props.chatWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#363940",
            borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
        }}
    >
        <h1>Chat</h1>
    </div>
);
}

export default Chat;
