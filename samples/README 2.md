# AWS in Plain English

A beautifully designed educational resource that explains 69 AWS services using clear analogies and real-world examples. No jargon, no confusion—just straightforward explanations.

## 🎯 Purpose

Understanding AWS shouldn't require a PhD. This site makes complex cloud concepts accessible through:
- Clear, analogy-based explanations
- Technical deep dives with real gotchas
- Real-world scenario examples
- Direct links to official AWS documentation

## ✨ Features

- **69 AWS Services** organized into 12 categories
- **Fuzzy Search** - Find services instantly
- **Progressive Disclosure** - Information revealed as needed
- **Mobile Responsive** - Works beautifully everywhere
- **Fast & Lightweight** - ~147KB gzipped
- **No Authentication** - Free for everyone

## 🎨 Design Philosophy

Inspired by clarity and simplicity:
- Clean, modern 2026 aesthetic
- Apple-inspired typography
- Subtle gradients and glass morphism
- Generous whitespace
- Delightful micro-interactions

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js (fuzzy search)
- **Routing**: Client-side state management
- **Hosting**: Static site (S3 + CloudFront ready)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── Header.tsx       # Top navigation
│   ├── SearchBar.tsx    # Search input
│   ├── CategoryList.tsx # Sidebar navigation
│   ├── ServiceCard.tsx  # Service detail display
│   └── Layout.tsx       # Main layout wrapper
├── data/
│   └── services.json    # 69 AWS services
├── lib/
│   ├── data.ts          # Data utilities
│   ├── search.ts        # Fuzzy search
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
├── App.tsx              # Main application
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 📊 Service Categories

1. Compute (7 services)
2. Storage (5 services)
3. Database (8 services)
4. Networking & Content Delivery (6 services)
5. Security, Identity & Compliance (9 services)
6. Management & Governance (7 services)
7. Application Integration (5 services)
8. Analytics & Business Intelligence (5 services)
9. AI & Machine Learning (8 services)
10. Developer Tools (4 services)
11. Containers & Orchestration (3 services)
12. IoT (2 services)

## 🎓 Target Audience

- AWS beginners
- Developers migrating from other platforms
- Solutions Architect certification candidates
- Anyone seeking clear AWS understanding

## 🔧 Maintenance

### Adding New Services

1. Edit `src/data/services.json`
2. Add new service entry with required fields:
   - `service_name`
   - `description`
   - `feynman_definition`
   - `architectural_deep_dive`
   - `scenario_example`
   - `aws_user_guide_documentation`
   - `category`
3. Run `npm run build`
4. Deploy

### Updating Existing Services

1. Edit the service entry in `src/data/services.json`
2. Rebuild and deploy

## 📈 Performance

- Initial load: ~147KB gzipped
- Time to interactive: < 2s on 3G
- Lighthouse score: 95+
- No runtime dependencies
- Client-side only (no backend)

## 🚢 Deployment

Ready for deployment to:
- AWS S3 + CloudFront
- Netlify
- Vercel
- Any static hosting service

See `implementation-guide.md` for detailed deployment instructions.

## 📝 License

Content is educational and references official AWS documentation.

## 🙏 Acknowledgments

Inspired by the teaching philosophy of making complex ideas accessible through clear explanations and analogies.

---

**Built with clarity in mind. No jargon, just understanding.**
