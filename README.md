# AI-Powered Molecular Research Laboratory Platform

A modern web platform for protein research with 3D visualization, AlphaFold predictions, and AI analysis tools.

## 🚀 Features

- **3D Molecular Visualization** - Interactive protein structure viewer with real PDB data
- **AlphaFold Integration** - Protein structure prediction with PDB sequence extraction
- **AI Analysis Tools** - Computational protein analysis with real structure metadata
- **Wet Lab Planning** - Intelligent experimental design and protocol optimization
- **PDB Search & Exploration** - Search and explore Protein Data Bank structures
- **RCSB PDB API Integration** - Real-time access to protein structure data
- **Modern Glassmorphism UI** - Beautiful transparent design with smooth animations
- **Real-time Processing** - Cloudflare Workers for fast AI computations

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **3D Graphics**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Cloudflare Workers
- **Deployment**: Netlify
- **AI Integration**: Cloudflare AI Workers
- **PDB API**: RCSB PDB Data API (REST & GraphQL)

## 📦 Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd DNA
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
# Copy .env.example to .env (or use existing .env)
# Default: uses deployed Cloudflare Worker
VITE_API_URL=https://ai-molecular-research.daivanfebrijuansetiya.workers.dev
```

4. Start development server
```bash
npm run dev
```

### 🔌 Backend Options

**Option 1: Use Deployed Worker (Recommended for Quick Start)**
- The default `.env` is already configured to use the deployed Cloudflare Worker
- No additional setup needed - just run `npm run dev`

**Option 2: Run Local Worker (For Backend Development)**
```bash
# Terminal 1: Start Cloudflare Worker locally
npm run worker:dev

# Terminal 2: Update .env to use local worker
# VITE_API_URL=http://localhost:8787

# Terminal 2: Start frontend
npm run dev
```

## 🚀 Deployment

### Deploy Frontend to Netlify

1. Build the project
```bash
npm run build
```

2. Deploy to Netlify
```bash
npm run deploy
```

### Deploy Backend to Cloudflare Workers

1. Install Wrangler CLI
```bash
npm install -g wrangler
```

2. Login to Cloudflare
```bash
wrangler login
```

3. Deploy worker
```bash
npm run worker:deploy
```

## 🔧 Configuration

1. Update `netlify.toml` with your Cloudflare Worker URL
2. Update `wrangler.toml` with your desired subdomain
3. Configure environment variables in Netlify dashboard

## 📱 Usage

1. **Homepage** - Explore platform features and capabilities
2. **3D Viewer** - Visualize protein structures interactively with real PDB data
3. **AlphaFold Predictor** - Upload sequences or load from PDB for structure prediction
4. **AI Analysis** - Analyze proteins with computational tools using real structure data
5. **Lab Planning** - Generate optimized experimental protocols
6. **PDB Search** - Search and explore Protein Data Bank structures

## 🎨 Design

The platform features a modern glassmorphism design with:
- Transparent glass-like components
- Smooth animations and transitions
- Responsive layout for all devices
- Beautiful gradient backgrounds
- Interactive 3D visualizations

## 🔬 Research Capabilities

### 3D Molecular Visualization
- Interactive protein structure manipulation with real PDB data
- Real-time rendering with WebGL
- Multiple representation modes (atoms, bonds, surface)
- Export capabilities for further analysis
- Direct PDB structure loading and visualization

### AlphaFold Integration
- Protein structure prediction from sequences
- Automatic sequence extraction from PDB structures
- Confidence scoring (PLDDT)
- Per-residue confidence visualization
- Downloadable PDB files

### AI Analysis Tools
- Protein stability analysis with real PDB metadata
- Binding site identification
- Molecular interaction mapping
- AI-driven recommendations
- Integration with PDB structure information

### PDB Search & Exploration
- Search Protein Data Bank structures
- Browse popular protein structures
- View detailed structure information
- Direct integration with 3D viewer and analysis tools

### Wet Lab Planning
- Automated protocol generation
- Material and cost estimation
- Safety guideline integration
- Timeline optimization

## 🌐 API Endpoints

The Cloudflare Worker provides the following endpoints:

- `POST /api/alphafold-predict` - Protein structure prediction
- `POST /api/analyze-protein` - Comprehensive protein analysis
- `POST /api/lab-planning` - Experimental protocol generation
- `GET /api/health` - Health check endpoint

### RCSB PDB API Integration

The platform integrates with the RCSB PDB Data API:

- **REST API**: `https://data.rcsb.org/rest/v1/core/`
- **GraphQL API**: `https://data.rcsb.org/graphql`
- **Structure Search**: Real-time PDB structure search and retrieval
- **Metadata Access**: Complete structure information including sequences, authors, methods

## 🔒 Security

- CORS enabled for cross-origin requests
- Input validation and sanitization
- Rate limiting and error handling
- Secure headers configuration

## 📊 Performance

- Optimized bundle size with Vite
- Lazy loading for 3D components
- Efficient state management
- CDN delivery via Netlify and Cloudflare

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Email: contact@aimolecular.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced molecular dynamics simulations
- [ ] Integration with external databases
- [ ] Mobile app development
- [ ] Enhanced AI model training
- [ ] Multi-language support

---

Made with ❤️ for scientific research
