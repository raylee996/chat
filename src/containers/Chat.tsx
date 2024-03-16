import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { OPENROUTER_API_KEY } from "../contants"
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Button, Container, FormControl, List, ListItem, ListItemAvatar, ListItemText, OutlinedInput, Snackbar, Tooltip } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";
import OpenAI from "openai";
import { ChatCompletionMessageParam, ErrorObject } from "openai/resources";

const size = {
  width: 24,
  height: 24
};

const avatarStrategy = new Map([
  ['user', {
    sx: {bgcolor: '#c0392b', fontSize: 12, ...size},
    children: 'LI'
  }],
  ['assistant', {
    sx: size,
    src: require('../assets/avatar.png')
  }]
]);

const listCss = {
  width: '100%', 
  maxHeight: 'calc(100vh - 86px)', 
  overflowY: 'auto', 
  '::-webkit-scrollbar': {
    width: 0,
    height: 0,
  }
};

const formCss = { 
  position: 'absolute', 
  bottom: 10, 
  width: '100%'
};

const buttonCss = {
  borderRadius: 2,
  padding: '4px',
  minWidth: '32px'
};

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: sessionStorage.getItem(OPENROUTER_API_KEY) as string,
  dangerouslyAllowBrowser: true
});

export default function Chat() {
  const [message, setMessage] = useState('');
  const [conversationContext, setConversationContext] = useState<Array<ChatCompletionMessageParam>>([]);
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
  });

  const listRef = useRef<HTMLUListElement | null>(null);

  const navigate = useNavigate();

  // 没有OpenRouter API key重定向到首页
  useEffect(() => {
    if (!sessionStorage.getItem(OPENROUTER_API_KEY)) {
      navigate('/');
    }
  }, [navigate]);
  
  async function chatWithGPT(messages: Array<ChatCompletionMessageParam>) {
    try {
      const completion = await openai.chat.completions.create({
        model: "mistralai/mistral-7b-instruct:free",
        messages
      });
      setConversationContext(messages.concat(completion.choices.map((item) => item.message)));
    } catch (err) {
      setFeedback({
        message: (err as ErrorObject).message,
        open: true
      });
      // OpenRouter API key有误
      if ((err as ErrorObject).code === '401') {
        sessionStorage.clear();
        navigate('/');
      }
    }
  }

  // 提交用户输入事件句柄
  function handleSend() {
    const res = conversationContext.concat({
      role: 'user',
      content: message
    });
    setConversationContext(res);
    chatWithGPT(res);
    setMessage('');
  }

  // 对话更新自动滚动到底部
  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = Number.MAX_SAFE_INTEGER;
    }
  }, [conversationContext])

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: '100vh' }} position='relative' display='flex' justifyContent='center'>
        <List ref={listRef} sx={listCss}>
          {
            conversationContext.map((item, i) => (
              <ListItem alignItems='flex-start' key={i}>
                <ListItemAvatar sx={{minWidth: 36}}>
                  <Avatar {...avatarStrategy.get(item.role)} />
                </ListItemAvatar>
                <ListItemText
                  primary={item.role === 'user' ? 'You' : 'ChatGPT'}
                  primaryTypographyProps={{
                    fontWeight: 'bold'
                  }}
                  secondary={<span dangerouslySetInnerHTML={{
                    __html: item.content as string
                  }} />}
                  secondaryTypographyProps={{
                    color: '#000'                    
                  }}
                />
              </ListItem>
            ))
          }
        </List>
        <FormControl sx={formCss} variant="outlined">
          <OutlinedInput 
            sx={{
              borderRadius: 5,
            }}
            placeholder='Message ChatGPT...'
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyUp={(e) => {
              if (['Enter', 'NumpadEnter'].includes(e.code)) {
                handleSend();
              }
            }}
            endAdornment={
              <Tooltip placement='top' title='Send massage' arrow>
                <Button 
                  variant='contained'
                  sx={buttonCss}
                  disabled={!message}
                  onClick={handleSend}
                >
                  <ArrowUpward sx={{color: '#fff'}} />
                </Button>
              </Tooltip>
            }
          />
        </FormControl>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
        open={feedback.open}
        message={feedback.message}
      />
    </Container>
  )
}
