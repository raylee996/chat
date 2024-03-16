import { useEffect, useState } from 'react';
import { OPENROUTER_API_KEY } from '../contants';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, OutlinedInput } from '@mui/material';

export default function Index() {
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  // 输入过OpenRouter API key重定向到聊天页
  useEffect(() => {
    if (sessionStorage.getItem(OPENROUTER_API_KEY)) {
      navigate('/chat')
    }
  }, [navigate]);

  const handleConfirm = () => {
    if (apiKey) {
      sessionStorage.setItem(OPENROUTER_API_KEY, apiKey);
      navigate('/chat');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: '100vh' }} display='flex' alignItems='center' justifyContent='center'>
        <FormControl sx={{width: '100%'}} variant="outlined">
          <OutlinedInput 
            sx={{
              borderRadius: 5,
              gap: 10
            }}
            placeholder='Message ChatGPT...'
            onChange={(e) => {
              setApiKey(e.target.value);
            }}
            onKeyUp={(e) => {
              if (['Enter', 'NumpadEnter'].includes(e.code)) {
                handleConfirm()
              }
            }}
            endAdornment={
              <Button 
                sx={{
                  borderRadius: 2
                }}
                variant='contained'
                disabled={!apiKey}
                onClick={handleConfirm}
              >
                confirm
              </Button>
            }
          />
        </FormControl>
      </Box>
    </Container>
  )
}
