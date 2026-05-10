const fallbackGradients = [
  'linear-gradient(135deg, #FF6B6B, #556270)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #84fab0, #8fd3f4)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)'
];

export const fetchBookDetailsFromInternet = async (title, author) => {
  try {
    const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const vol = data.items[0].volumeInfo;
      return {
        id: data.items[0].id || Math.random().toString(),
        title: vol.title || title,
        author: vol.authors ? vol.authors.join(', ') : author,
        description: vol.description || 'No description available from Google Books.',
        coverUrl: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        category: vol.categories ? vol.categories[0] : 'Literature',
        coverColor: fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)]
      };
    }
  } catch(e) {
    console.error(e);
  }
  return {
    id: Math.random().toString(), title, author,
    description: 'A highly recommended book matching your interests.',
    coverUrl: null, category: 'Book',
    coverColor: fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)]
  };
};
