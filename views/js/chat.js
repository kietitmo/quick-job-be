const chatSocket = io('http://localhost:3000', {
  query: {
    userId: 42,
  },
});

chatSocket.on('connect', () => {
  console.log('Socket connected');
});

chatSocket.on('disconnect', () => {
  console.log('Socket disconnected');
});

// Thực hiện các xử lý khác tại đây
