/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#17211f',
        mist: '#eef3f0',
        cedar: '#28645c',
        amberline: '#d98d24',
        rosewood: '#9d3f45'
      }
    }
  },
  plugins: []
};

