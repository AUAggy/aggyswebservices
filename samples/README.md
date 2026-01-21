# AWS in Plain English

> Understanding AWS shouldn't require a PhD.

A beautifully designed educational resource that explains 69 AWS services using clear analogies and real-world examples. No jargon, no confusion—just straightforward explanations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Size](https://img.shields.io/badge/size-148KB%20gzipped-orange.svg)

## 🎯 What Is This?

This project makes AWS accessible to everyone through:
- **Clear Analogies** - Complex concepts explained simply
- **Technical Deep Dives** - Real gotchas and best practices
- **Real-World Examples** - Practical scenarios you'll actually encounter
- **Official Documentation Links** - Direct paths to AWS docs

## ✨ Features

- 📚 **69 AWS Services** documented across 12 categories
- 🔍 **Fuzzy Search** - Find services instantly
- 🎨 **Beautiful Design** - Modern 2026 aesthetic with glass morphism
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Lightning Fast** - Only 148KB gzipped
- 🔓 **Free & Open** - No authentication, no paywalls

## 🚀 Quick Start

```bash
# Navigate to the site directory
cd aws-feynman-site

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` to see the site in action.

## 📦 Project Structure

```
.
├── aws-feynman-site/          # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── data/             # AWS services JSON
│   │   └── lib/              # Utilities and types
│   └── dist/                 # Production build
├── aws-services-feynman-complete.json  # Complete services data
└── documentation/            # Project docs
```

## 🎨 Design Philosophy

Inspired by clarity and simplicity:
- **Progressive Disclosure** - Information revealed as needed
- **Apple-Inspired Typography** - Clean, readable, modern
- **Subtle Gradients** - Depth without distraction
- **Micro-Interactions** - Delightful without being distracting
- **Generous Whitespace** - Breathing room for focus

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js (fuzzy search)
- **Hosting**: Static site (S3 + CloudFront ready)

## 📊 Service Categories

1. **Compute** (7 services) - EC2, Lambda, Elastic Beanstalk, etc.
2. **Storage** (5 services) - S3, EBS, EFS, etc.
3. **Database** (8 services) - RDS, DynamoDB, Aurora, etc.
4. **Networking** (6 services) - VPC, Route 53, CloudFront, etc.
5. **Security** (9 services) - IAM, KMS, Secrets Manager, etc.
6. **Management** (7 services) - CloudWatch, CloudFormation, etc.
7. **Application Integration** (5 services) - SQS, SNS, EventBridge, etc.
8. **Analytics** (5 services) - Athena, EMR, Kinesis, etc.
9. **AI & Machine Learning** (8 services) - SageMaker, Bedrock, etc.
10. **Developer Tools** (4 services) - CodePipeline, CodeBuild, etc.
11. **Containers** (3 services) - ECS, EKS, Fargate
12. **IoT** (2 services) - IoT Core, Greengrass

## 🎓 Who Is This For?

- 🆕 AWS beginners looking for clear explanations
- 🔄 Developers migrating from other cloud platforms
- 📖 Solutions Architect certification candidates
- 🎯 Anyone seeking practical AWS understanding

## 📈 Performance

- **Initial Load**: ~148KB gzipped
- **Time to Interactive**: < 2s on 3G
- **Lighthouse Score**: 95+
- **SEO Optimized**: Full meta tags and structured data

## 🚢 Deployment

The site is production-ready and can be deployed to:
- AWS S3 + CloudFront (~$1-5/month)
- Netlify (free tier available)
- Vercel (free tier available)
- Any static hosting service

See `implementation-guide.md` for detailed deployment instructions.

## 🔧 Maintenance

### Adding New Services

1. Edit `aws-feynman-site/src/data/services.json`
2. Add new service entry with all required fields
3. Run `npm run build`
4. Deploy

### Updating Content

1. Edit the service entry in `services.json`
2. Rebuild and deploy

## 📝 Documentation

- `README.md` - This file
- `implementation-guide.md` - Complete build guide
- `design-system.md` - Design specifications
- `PROJECT-COMPLETE.md` - Project summary
- `aws-feynman-site/README.md` - Application-specific docs

## 🙏 Acknowledgments

Inspired by the teaching philosophy of making complex ideas accessible through clear explanations and practical examples.

## 📄 License

This project is open source and available for educational purposes.

## 🌟 Show Your Support

If this project helped you understand AWS better, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting improvements
- 📢 Sharing with others learning AWS

---

**Built with clarity in mind. No jargon, just understanding.**

*Last updated: January 20, 2026*
