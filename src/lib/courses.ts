import { Course, Lesson } from './types';

// Sample video URLs — verified publicly accessible MP4s.
// (Previous Google Cloud Storage URLs return HTTP 403 AccessDenied.)
const SAMPLE_VIDEO_1 = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4';
const SAMPLE_VIDEO_2 = 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4';
const SAMPLE_VIDEO_3 = 'https://www.w3schools.com/html/mov_bbb.mp4';
const SAMPLE_VIDEO_4 = 'https://www.w3schools.com/html/movie.mp4';
const SAMPLE_VIDEO_5 = 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4';
const SAMPLE_VIDEO_6 = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

export const COURSES: Course[] = [
  // ============================================================
  // 1. AI & Machine Learning
  // ============================================================
  {
    id: 'ai-ml',
    slug: 'ai-machine-learning',
    title: 'AI & Machine Learning',
    subtitle: 'Master AI, ML, Deep Learning & LLMs from scratch',
    description: 'Comprehensive AI course covering Python, classical ML, neural networks, NLP, and modern LLMs.',
    longDescription:
      'This end-to-end AI & Machine Learning program takes you from Python fundamentals all the way to building and deploying modern large language model applications. You will start with the mathematical foundations of machine learning, progress through classical algorithms like linear regression, decision trees, and clustering, then dive into deep learning with neural networks using PyTorch. The final modules cover natural language processing, transformers, and hands-on LLM application development with prompting, fine-tuning, and RAG (Retrieval-Augmented Generation). Every concept is reinforced through step-wise labs, video walkthroughs, and graded assessments so you graduate with a portfolio of real AI projects.',
    icon: 'BrainCircuit',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    level: 'All Levels',
    duration: '14 weeks',
    lessonsCount: 24,
    studentsCount: '12,480',
    rating: 4.9,
    instructor: 'Dr. Anika Sharma',
    instructorTitle: 'PhD ML, ex-Google DeepMind',
    tags: ['Python', 'PyTorch', 'Neural Networks', 'NLP', 'LLMs', 'RAG'],
    whatYouLearn: [
      'Build and train neural networks from scratch using PyTorch',
      'Implement classical ML algorithms: regression, classification, clustering',
      'Engineer features and evaluate models with rigorous metrics',
      'Deploy transformers and fine-tune pre-trained LLMs',
      'Build RAG pipelines that ground LLMs in your own data',
      'Ship AI applications to production with proper monitoring',
    ],
    prerequisites: [
      'Basic programming experience (any language)',
      'High-school level mathematics (algebra, basic statistics)',
      'A laptop with 8GB+ RAM (16GB recommended)',
    ],
    modules: [
      {
        id: 'ai-m1',
        title: 'Module 1 — Python & Data Foundations',
        description: 'Set up your environment and master the Python data stack (NumPy, Pandas, Matplotlib).',
        lessons: [
          {
            id: 'ai-m1-l1',
            title: 'Setting Up Your AI Environment',
            description: 'Install Python, conda, Jupyter, and the core data-science libraries.',
            duration: '45 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Install Miniconda',
                content:
                  'Miniconda gives you a minimal Python distribution plus the conda package manager. Download the installer for your operating system from conda.io and run it. On Linux/macOS you can use the bash installer; on Windows use the GUI installer and select "Add to PATH" during installation. Verify your install by opening a terminal and running `conda --version`.',
                tip: 'Use a fresh conda environment per project to avoid dependency conflicts.',
              },
              {
                title: 'Create an isolated environment',
                content:
                  'Create a dedicated environment named `ai-tutor` so your AI packages do not pollute the global Python. Activating the environment ensures every package you install lives only inside it, making projects reproducible.',
                code: 'conda create -n ai-tutor python=3.11 -y\nconda activate ai-tutor',
                codeLanguage: 'bash',
              },
              {
                title: 'Install core libraries',
                content:
                  'Install the foundational data-science stack: NumPy for arrays, Pandas for tabular data, Matplotlib and Seaborn for plotting, Scikit-learn for classical ML, JupyterLab for notebooks, and PyTorch for deep learning. Use the CUDA build of PyTorch if you have an NVIDIA GPU; otherwise the CPU build works fine for learning.',
                code: 'pip install numpy pandas matplotlib seaborn scikit-learn jupyterlab\npip install torch torchvision --index-url https://download.pytorch.org/whl/cpu',
                codeLanguage: 'bash',
                tip: 'Pin your versions in a requirements.txt file for reproducibility.',
              },
              {
                title: 'Launch JupyterLab and verify',
                content:
                  'Start JupyterLab with `jupyter lab` and create a new notebook. Import each library and print the versions. If every import succeeds without error, your environment is ready for the rest of the course.',
                code: "import numpy as np, pandas as pd, matplotlib, sklearn, torch\nprint('numpy', np.__version__)\nprint('pandas', pd.__version__)\nprint('torch', torch.__version__)\nprint('GPU available:', torch.cuda.is_available())",
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'ai-m1-l1-q1',
                question: 'Why should you create a separate conda environment per project?',
                options: [
                  'It runs faster than the base environment',
                  'It isolates dependencies and prevents version conflicts between projects',
                  'It is required to use PyTorch',
                  'It automatically downloads datasets',
                ],
                correctAnswer: 1,
                explanation:
                  'Isolated environments keep each project\'s dependency tree separate, so an upgrade in one project cannot break another.',
              },
              {
                id: 'ai-m1-l1-q2',
                question: 'Which library is primarily used for tabular data manipulation in Python?',
                options: ['NumPy', 'Matplotlib', 'Pandas', 'PyTorch'],
                correctAnswer: 2,
                explanation: 'Pandas provides the DataFrame abstraction designed for tabular data analysis.',
              },
              {
                id: 'ai-m1-l1-q3',
                question: 'What does `torch.cuda.is_available()` return when no NVIDIA GPU is present?',
                options: ['True', 'False', 'An error', 'None'],
                correctAnswer: 1,
                explanation: 'On systems without a CUDA-capable GPU, this function returns False and PyTorch runs on CPU.',
              },
            ],
          },
          {
            id: 'ai-m1-l2',
            title: 'NumPy & Pandas Crash Course',
            description: 'Vectorized operations, indexing, grouping, and the DataFrame mindset.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Understand vectorization',
                content:
                  'NumPy lets you operate on entire arrays at once instead of looping in Python. Vectorized operations run in optimized C code and can be 100x faster than Python loops. Always prefer array operations over for-loops when working with numerical data.',
                code: 'import numpy as np\na = np.arange(1_000_000)\nb = a * 2 + 1   # vectorized, fast\nc = [x*2+1 for x in a]  # slow Python loop',
                codeLanguage: 'python',
              },
              {
                title: 'Load and inspect a dataset',
                content:
                  'Pandas reads CSVs into a DataFrame, a 2D labeled table. Always inspect the first few rows, data types, and missing values before doing any modeling. Use `.info()` and `.describe()` to get a quick statistical summary.',
                code: "import pandas as pd\ndf = pd.read_csv('students.csv')\nprint(df.head())\nprint(df.info())\nprint(df.describe())",
                codeLanguage: 'python',
              },
              {
                title: 'Group, filter, and aggregate',
                content:
                  'The split-apply-combine pattern is the workhorse of data analysis. Use `.groupby()` to split rows by a key, apply an aggregation, and combine results. Combine with boolean masks to filter rows before grouping.',
                code: "avg = df.groupby('major')['score'].mean()\ntop = df[df['score'] > 90].groupby('major').size()",
                codeLanguage: 'python',
                tip: 'Chain operations with .pipe() or method chaining for readable pipelines.',
              },
            ],
            quiz: [
              {
                id: 'ai-m1-l2-q1',
                question: 'Why is vectorization preferred over Python loops in NumPy?',
                options: [
                  'It uses less memory by default',
                  'It runs in optimized C code and is much faster',
                  'It is the only way to do math in Python',
                  'It automatically saves results to disk',
                ],
                correctAnswer: 1,
                explanation: 'NumPy vectorized operations execute in compiled C, avoiding Python interpreter overhead.',
              },
              {
                id: 'ai-m1-l2-q2',
                question: 'Which method splits a DataFrame by a key and aggregates?',
                options: ['.split()', '.groupby()', '.partition()', '.aggregate()'],
                correctAnswer: 1,
                explanation: 'DataFrame.groupby() implements the split-apply-combine pattern.',
              },
            ],
          },
        ],
      },
      {
        id: 'ai-m2',
        title: 'Module 2 — Classical Machine Learning',
        description: 'Supervised and unsupervised learning with Scikit-learn, from regression to clustering.',
        lessons: [
          {
            id: 'ai-m2-l1',
            title: 'Linear Regression from First Principles',
            description: 'Derive the cost function, implement gradient descent, then use sklearn.',
            duration: '75 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Frame the problem',
                content:
                  'Linear regression fits a line y = wx + b that minimizes the mean squared error between predictions and targets. Understanding the cost function and gradient descent gives you the foundation for every neural network you will build later.',
                code: 'y_pred = w * x + b\nloss = ((y_pred - y) ** 2).mean()',
                codeLanguage: 'python',
              },
              {
                title: 'Implement gradient descent',
                content:
                  'Compute the partial derivatives of MSE with respect to w and b, then take small steps in the opposite direction. The learning rate controls step size — too large diverges, too small is slow. Monitor loss over iterations to confirm convergence.',
                code: "w, b = 0.0, 0.0\nlr = 0.01\nfor epoch in range(1000):\n    y_pred = w * x + b\n    grad_w = (2/n) * ((y_pred - y) * x).sum()\n    grad_b = (2/n) * (y_pred - y).sum()\n    w -= lr * grad_w\n    b -= lr * grad_b",
                codeLanguage: 'python',
                tip: 'Always shuffle your data and use mini-batches when datasets grow large.',
              },
              {
                title: 'Use Scikit-learn the right way',
                content:
                  'In practice you will use sklearn\'s LinearRegression, but you should still split your data into train/test, fit on the train set, and evaluate on the test set. Always scale features for regularized models (Ridge, Lasso) so penalties are applied fairly.',
                code: "from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = LinearRegression().fit(X_tr, y_tr)\nmse = mean_squared_error(y_te, model.predict(X_te))",
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'ai-m2-l1-q1',
                question: 'What does the learning rate control in gradient descent?',
                options: [
                  'The number of features used',
                  'The size of each step taken toward the minimum',
                  'The number of training examples',
                  'The type of activation function',
                ],
                correctAnswer: 1,
                explanation: 'The learning rate scales the gradient, controlling step size. Too large diverges; too small converges slowly.',
              },
              {
                id: 'ai-m2-l1-q2',
                question: 'Why do we split data into train and test sets?',
                options: [
                  'To make training faster',
                  'To evaluate generalization to unseen data and detect overfitting',
                  'Because sklearn requires two arguments',
                  'To reduce memory usage',
                ],
                correctAnswer: 1,
                explanation: 'A held-out test set reveals whether the model generalizes or merely memorized the training data.',
              },
              {
                id: 'ai-m2-l1-q3',
                question: 'Which metric does ordinary least squares regression minimize?',
                options: ['Mean Absolute Error', 'Mean Squared Error', 'Log Loss', 'Accuracy'],
                correctAnswer: 1,
                explanation: 'OLS minimizes the sum of squared residuals, equivalent to mean squared error.',
              },
            ],
          },
          {
            id: 'ai-m2-l2',
            title: 'Classification with Decision Trees & Random Forests',
            description: 'Tree-based models, ensemble learning, and the bias-variance trade-off.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Grow a decision tree',
                content:
                  'A decision tree splits data on the feature that best separates classes, measured by Gini impurity or entropy. Trees are interpretable but prone to overfitting when grown deep. Use `max_depth` and `min_samples_leaf` to control complexity.',
                code: "from sklearn.tree import DecisionTreeClassifier\ntree = DecisionTreeClassifier(max_depth=4, random_state=42)\ntree.fit(X_tr, y_tr)",
                codeLanguage: 'python',
              },
              {
                title: 'Build a random forest',
                content:
                  'A random forest trains many trees on bootstrapped samples and averages their predictions. This reduces variance without increasing bias, giving strong out-of-the-box performance. The `n_estimators` parameter controls the number of trees.',
                code: "from sklearn.ensemble import RandomForestClassifier\nrf = RandomForestClassifier(n_estimators=200, random_state=42)\nrf.fit(X_tr, y_tr)",
                codeLanguage: 'python',
                tip: 'Use feature_importances_ to identify which features drive predictions.',
              },
              {
                title: 'Evaluate properly',
                content:
                  'Accuracy alone can mislead on imbalanced datasets. Always look at precision, recall, F1, and the confusion matrix. For probabilistic decisions, inspect the ROC curve and AUC. Use cross-validation to get robust performance estimates.',
                code: "from sklearn.metrics import classification_report, roc_auc_score\nprint(classification_report(y_te, rf.predict(X_te)))\nprint('AUC:', roc_auc_score(y_te, rf.predict_proba(X_te)[:, 1]))",
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'ai-m2-l2-q1',
                question: 'What is the main benefit of a random forest over a single decision tree?',
                options: [
                  'It is faster to train',
                  'It reduces variance by averaging many trees',
                  'It does not need any hyperparameters',
                  'It always produces perfect predictions',
                ],
                correctAnswer: 1,
                explanation: 'Random forests reduce variance through bagging and feature randomness, while keeping bias low.',
              },
              {
                id: 'ai-m2-l2-q2',
                question: 'Which metric is best for evaluating a classifier on an imbalanced dataset?',
                options: ['Accuracy', 'F1 score or AUC', 'Training loss', 'Number of features'],
                correctAnswer: 1,
                explanation: 'F1 and AUC account for class imbalance, unlike raw accuracy which can be misleading.',
              },
            ],
          },
        ],
      },
      {
        id: 'ai-m3',
        title: 'Module 3 — Deep Learning with PyTorch',
        description: 'Tensors, autograd, building and training neural networks.',
        lessons: [
          {
            id: 'ai-m3-l1',
            title: 'Your First Neural Network',
            description: 'Build a feed-forward network to classify handwritten digits (MNIST).',
            duration: '90 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Define the model',
                content:
                  'A feed-forward network stacks linear layers with non-linear activations. For MNIST, flatten 28x28 images into 784-dim vectors, pass through hidden layers with ReLU, and output 10 logits for digits 0–9. Use `nn.Module` to encapsulate layers and forward pass.',
                code: "import torch.nn as nn\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Flatten(),\n            nn.Linear(784, 128), nn.ReLU(),\n            nn.Linear(128, 64), nn.ReLU(),\n            nn.Linear(64, 10),\n        )\n    def forward(self, x):\n        return self.net(x)",
                codeLanguage: 'python',
              },
              {
                title: 'Pick loss and optimizer',
                content:
                  'For multi-class classification, use cross-entropy loss which combines log-softmax and negative log-likelihood. The Adam optimizer adapts the learning rate per parameter and is a strong default. A learning rate of 1e-3 works well for most small networks.',
                code: "import torch.optim as optim\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.Adam(model.parameters(), lr=1e-3)",
                codeLanguage: 'python',
              },
              {
                title: 'Train the loop',
                content:
                  'The training loop has four steps per batch: forward pass, compute loss, backward pass to populate gradients, and optimizer step to update weights. Always call `optimizer.zero_grad()` first to clear stale gradients. Evaluate on a validation set after each epoch.',
                code: "for epoch in range(5):\n    for xb, yb in train_loader:\n        optimizer.zero_grad()\n        preds = model(xb)\n        loss = criterion(preds, yb)\n        loss.backward()\n        optimizer.step()",
                codeLanguage: 'python',
                tip: 'Use model.eval() and torch.no_grad() when evaluating to disable dropout and save memory.',
              },
            ],
            quiz: [
              {
                id: 'ai-m3-l1-q1',
                question: 'What does the backward() call do in PyTorch?',
                options: [
                  'Resets the model weights to zero',
                  'Computes gradients of the loss with respect to parameters via autograd',
                  'Moves the model to GPU',
                  'Saves the model to disk',
                ],
                correctAnswer: 1,
                explanation: 'loss.backward() runs reverse-mode autodiff, populating .grad on every parameter with a gradient.',
              },
              {
                id: 'ai-m3-l1-q2',
                question: 'Why must you call optimizer.zero_grad() before each step?',
                options: [
                  'To initialize the optimizer',
                  'To prevent gradients from accumulating across batches',
                  'To free GPU memory',
                  'To increase the learning rate',
                ],
                correctAnswer: 1,
                explanation: 'PyTorch accumulates gradients by default; zeroing prevents stale gradients from previous batches contaminating the current update.',
              },
              {
                id: 'ai-m3-l1-q3',
                question: 'Which loss is standard for multi-class classification in PyTorch?',
                options: ['MSELoss', 'BCELoss', 'CrossEntropyLoss', 'L1Loss'],
                correctAnswer: 2,
                explanation: 'nn.CrossEntropyLoss combines log-softmax and NLL, ideal for multi-class problems with integer labels.',
              },
            ],
          },
        ],
      },
      {
        id: 'ai-m4',
        title: 'Module 4 — LLMs & RAG Applications',
        description: 'Prompt engineering, fine-tuning basics, and building RAG pipelines.',
        lessons: [
          {
            id: 'ai-m4-l1',
            title: 'Building a RAG Pipeline',
            description: 'Ground an LLM in your own documents using embeddings and vector search.',
            duration: '85 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Chunk your documents',
                content:
                  'Long documents must be split into chunks small enough to fit in the model\'s context window and to retrieve precisely. A common strategy is fixed-size chunks of 500–1000 tokens with 50–100 token overlap. LangChain and LlamaIndex both provide text splitters for this.',
                code: "from langchain.text_splitter import RecursiveCharacterTextSplitter\nsplitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)\nchunks = splitter.split_text(long_document)",
                codeLanguage: 'python',
              },
              {
                title: 'Embed and store in a vector database',
                content:
                  'Convert each chunk into a dense embedding using an embedding model such as text-embedding-3-small. Store embeddings in a vector database like Chroma, FAISS, or Pinecone. The database supports fast nearest-neighbor search so you can retrieve the most relevant chunks for any query.',
                code: "import chromadb\nfrom chromadb.utils import embedding_functions\nclient = chromadb.Client()\nef = embedding_functions.DefaultEmbeddingFunction()\ncol = client.create_collection('docs', embedding_function=ef)\ncol.add(documents=chunks, ids=[str(i) for i in range(len(chunks))])",
                codeLanguage: 'python',
                tip: 'Re-embed all documents when you switch embedding models — embeddings are not interchangeable.',
              },
              {
                title: 'Retrieve and generate',
                content:
                  'At query time, embed the user\'s question, retrieve the top-k matching chunks, and feed them along with the question to the LLM as context. Prompt the model to answer only from the provided context to reduce hallucinations. Cite which chunk each claim came from for trustworthiness.',
                code: "results = col.query(query_texts=[user_question], n_results=4)\ncontext = '\\n\\n'.join(results['documents'][0])\nprompt = f'Answer using only this context:\\n{context}\\n\\nQuestion: {user_question}'\nanswer = llm.generate(prompt)",
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'ai-m4-l1-q1',
                question: 'What is the main purpose of chunking documents in a RAG pipeline?',
                options: [
                  'To compress files for storage',
                  'To enable precise retrieval that fits the model context window',
                  'To translate documents to English',
                  'To remove stopwords',
                ],
                correctAnswer: 1,
                explanation: 'Chunking balances precision and context-fit, allowing the retriever to surface only the most relevant passages.',
              },
              {
                id: 'ai-m4-l1-q2',
                question: 'Why prompt the LLM to "answer only from the provided context"?',
                options: [
                  'To make responses shorter',
                  'To reduce hallucinations and keep answers grounded in your data',
                  'To use fewer tokens',
                  'To avoid paying for the API',
                ],
                correctAnswer: 1,
                explanation: 'Constraining the model to the context window reduces fabricated answers and improves trustworthiness.',
              },
              {
                id: 'ai-m4-l1-q3',
                question: 'Which of the following is a vector database?',
                options: ['PostgreSQL', 'Chroma', 'Redis', 'NGINX'],
                correctAnswer: 1,
                explanation: 'Chroma is a popular open-source vector database optimized for embedding similarity search.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 199,
    monthlyPrice: 29,
    annualPrice: 290,
    onDemand: true,
    categoryIds: ['cat-ai', 'cat-backend'],
    expiresAfterDays: 365,
  },

  // ============================================================
  // 2. Full Stack Java
  // ============================================================
  {
    id: 'java-fullstack',
    slug: 'full-stack-java',
    title: 'Full Stack Java Development',
    subtitle: 'Spring Boot backend + React frontend + MySQL + deployment',
    description: 'Build production web applications with Spring Boot, React, and MySQL — start to finish.',
    longDescription:
      'Become a job-ready Full Stack Java developer by building a complete, production-grade web application end to end. The backend track covers Java 17+, Spring Boot 3, REST API design, Spring Security with JWT, Spring Data JPA, and MySQL integration. The frontend track covers React 18, hooks, routing, state management with Zustand, and TanStack Query for server state. You will then integrate both sides with a clean REST API, write automated tests with JUnit and React Testing Library, containerize the app with Docker, and deploy to a cloud provider. Each module includes step-wise labs, video walkthroughs, and graded quizzes.',
    icon: 'Coffee',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    level: 'Intermediate',
    duration: '12 weeks',
    lessonsCount: 22,
    studentsCount: '9,840',
    rating: 4.8,
    instructor: 'Ravi Menon',
    instructorTitle: 'Senior Engineer, ex-Amazon',
    tags: ['Java 17', 'Spring Boot 3', 'React 18', 'MySQL', 'Docker', 'JWT'],
    whatYouLearn: [
      'Build REST APIs with Spring Boot 3 and Java 17+',
      'Model data with JPA entities and MySQL',
      'Secure APIs with Spring Security and JWT',
      'Build reactive React 18 UIs with hooks and TanStack Query',
      'Test backend with JUnit 5 and frontend with React Testing Library',
      'Containerize and deploy with Docker and CI/CD',
    ],
    prerequisites: [
      'Basic Java or any object-oriented programming experience',
      'Familiarity with HTML, CSS, and JavaScript',
      'A computer with at least 8GB RAM',
    ],
    modules: [
      {
        id: 'j-m1',
        title: 'Module 1 — Spring Boot Fundamentals',
        description: 'Bootstrap a Spring Boot app, structure a project, and expose your first REST endpoint.',
        lessons: [
          {
            id: 'j-m1-l1',
            title: 'Bootstrapping a Spring Boot Project',
            description: 'Use Spring Initializr, understand starters, and run your first app.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Generate the project',
                content:
                  'Spring Initializr (start.spring.io) generates a ready-to-build Maven or Gradle project with the dependencies you select. Choose Java 17, Spring Boot 3.x, and add Spring Web, Spring Data JPA, MySQL Driver, Lombok, and Validation. Download, unzip, and open in IntelliJ IDEA or VS Code.',
                tip: 'Always pin the Spring Boot minor version in pom.xml to avoid surprise upgrades.',
              },
              {
                title: 'Understand starters and auto-configuration',
                content:
                  'Spring Boot starters bundle common dependencies for a feature (e.g., spring-boot-starter-web pulls Tomcat, Spring MVC, Jackson). Auto-configuration inspects the classpath and wires beans for you — for example, @SpringBootApplication triggers a web context when starter-web is present. You can opt out of any auto-config with exclude= in @EnableAutoConfiguration.',
                code: '<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-web</artifactId>\n</dependency>',
                codeLanguage: 'xml',
              },
              {
                title: 'Run the application',
                content:
                  'Run the main class — Spring Boot embeds Tomcat on port 8080 by default. Override the port in application.properties if needed. Visit http://localhost:8080 to confirm the server is up; you should see a 404 page (no endpoints yet) which proves the server is responding.',
                code: '@SpringBootApplication\npublic class App { public static void main(String[] a){ SpringApplication.run(App.class,a);} }\n\n# application.properties\nserver.port=8080',
                codeLanguage: 'java',
              },
            ],
            quiz: [
              {
                id: 'j-m1-l1-q1',
                question: 'What does a Spring Boot starter do?',
                options: [
                  'Compiles Java code faster',
                  'Bundles a set of related dependencies for a feature',
                  'Replaces the JVM',
                  'Generates database schemas',
                ],
                correctAnswer: 1,
                explanation: 'Starters are dependency descriptors that pull everything needed for a feature, e.g. starter-web pulls Spring MVC + Tomcat + Jackson.',
              },
              {
                id: 'j-m1-l1-q2',
                question: 'Which port does Spring Boot use by default?',
                options: ['3000', '8000', '8080', '443'],
                correctAnswer: 2,
                explanation: 'Embedded Tomcat listens on 8080 by default; override with server.port in application.properties.',
              },
              {
                id: 'j-m1-l1-q3',
                question: 'What triggers Spring Boot auto-configuration?',
                options: [
                  'The @SpringBootApplication annotation on the main class',
                  'A special JVM flag',
                  'Maven only',
                  'Tomcat automatically',
                ],
                correctAnswer: 0,
                explanation: '@SpringBootApplication includes @EnableAutoConfiguration which inspects the classpath and wires beans.',
              },
            ],
          },
          {
            id: 'j-m1-l2',
            title: 'Building Your First REST API',
            description: 'Controllers, DTOs, validation, and HTTP status codes.',
            duration: '65 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Create a controller',
                content:
                  'A @RestController combines @Controller and @ResponseBody, returning JSON by default. Map HTTP verbs with @GetMapping, @PostMapping, etc. Use path variables and request params to capture input. Always return proper HTTP status codes — 201 Created for new resources, 404 for missing, 400 for bad input.',
                code: '@RestController\n@RequestMapping("/api/tasks")\npublic class TaskController {\n    @GetMapping("/{id}")\n    public Task get(@PathVariable Long id){ return service.get(id); }\n    @PostMapping\n    public ResponseEntity<Task> create(@Valid @RequestBody TaskDto dto){\n        Task t = service.create(dto);\n        return ResponseEntity.created(URI.create("/api/tasks/"+t.getId())).body(t);\n    }\n}',
                codeLanguage: 'java',
              },
              {
                title: 'Validate input with Bean Validation',
                content:
                  'Add @Valid on the request body and annotations like @NotBlank, @Size, @Email on the DTO fields. Spring throws MethodArgumentNotValidException automatically. Handle it in a @RestControllerAdvice to return a clean JSON error response with field-level messages.',
                code: 'public record TaskDto(\n    @NotBlank @Size(min=3,max=100) String title,\n    @Size(max=500) String description\n) {}',
                codeLanguage: 'java',
                tip: 'Return field-level error maps so the frontend can show inline validation messages.',
              },
              {
                title: 'Document with OpenAPI',
                content:
                  'Add springdoc-openapi-starter-webmvc-ui to auto-generate Swagger UI at /swagger-ui.html. Annotate controllers with @Operation and @ApiResponses to document endpoints without writing external docs. This becomes the contract for your frontend team.',
                code: '<dependency>\n  <groupId>org.springdoc</groupId>\n  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>\n  <version>2.5.0</version>\n</dependency>',
                codeLanguage: 'xml',
              },
            ],
            quiz: [
              {
                id: 'j-m1-l2-q1',
                question: 'Which annotation marks a class as a REST controller that returns JSON?',
                options: ['@Controller', '@RestController', '@Component', '@Service'],
                correctAnswer: 1,
                explanation: '@RestController combines @Controller + @ResponseBody so methods return objects serialized to JSON.',
              },
              {
                id: 'j-m1-l2-q2',
                question: 'Which HTTP status should you return when creating a new resource?',
                options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
                correctAnswer: 1,
                explanation: '201 Created is the correct status for a successful POST that creates a resource, ideally with a Location header.',
              },
              {
                id: 'j-m1-l2-q3',
                question: 'What does @Valid trigger in a Spring controller?',
                options: [
                  'Java compilation checks',
                  'Bean Validation on the request body',
                  'SQL injection protection',
                  'Auto-generation of OpenAPI docs',
                ],
                correctAnswer: 1,
                explanation: '@Valid triggers JSR-380 Bean Validation, throwing MethodArgumentNotValidException if constraints fail.',
              },
            ],
          },
        ],
      },
      {
        id: 'j-m2',
        title: 'Module 2 — Data Layer with JPA & MySQL',
        description: 'Entities, repositories, relationships, and query methods.',
        lessons: [
          {
            id: 'j-m2-l1',
            title: 'Modeling Entities & Relationships',
            description: 'JPA annotations, one-to-many, and cascade rules.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Define an entity',
                content:
                  'A JPA entity is a Java class mapped to a table. Use @Entity, @Table, @Id, @GeneratedValue. Use Lombok @Getter/@Setter to cut boilerplate. Always override equals/hashCode on the id field for safe collection use. Use LocalDate/Instant rather than java.util.Date for time fields.',
                code: '@Entity @Table(name="tasks")\n@Getter @Setter\npublic class Task {\n  @Id @GeneratedValue(strategy=IDENTITY)\n  private Long id;\n  @NotBlank private String title;\n  private boolean done;\n  @ManyToOne(fetch=LAZY) @JoinColumn(name="user_id")\n  private User owner;\n}',
                codeLanguage: 'java',
              },
              {
                title: 'Use Spring Data repositories',
                content:
                  'Extend JpaRepository to get CRUD methods for free. Add derived query methods like findByOwnerEmail — Spring parses the method name and writes the SQL. For complex queries use @Query with JPQL or native SQL. Always paginate list endpoints with Pageable to avoid loading huge result sets.',
                code: 'public interface TaskRepository extends JpaRepository<Task,Long> {\n  Page<Task> findByOwnerEmail(String email, Pageable p);\n  @Query("select t from Task t where t.done = false and t.owner.id = :uid")\n  List<Task> openTasks(@Param("uid") Long userId);\n}',
                codeLanguage: 'java',
                tip: 'Mark *ToMany associations LAZY to avoid N+1 issues and accidental eager loads.',
              },
              {
                title: 'Configure MySQL',
                content:
                  'Add the MySQL driver and configure the datasource in application.properties. Set spring.jpa.hibernate.ddl-auto=update for development; for production use Flyway or Liquibase migrations instead. Add a connection pool (HikariCP is bundled) and tune pool size for your workload.',
                code: 'spring.datasource.url=jdbc:mysql://localhost:3306/tasksdb\nspring.datasource.username=root\nspring.datasource.password=secret\nspring.jpa.hibernate.ddl-auto=update\nspring.jpa.show-sql=true',
                codeLanguage: 'properties',
              },
            ],
            quiz: [
              {
                id: 'j-m2-l1-q1',
                question: 'Which annotation marks a class as a JPA entity?',
                options: ['@Component', '@Entity', '@Repository', '@Table'],
                correctAnswer: 1,
                explanation: '@Entity marks a class as a JPA-managed entity mapped to a database table.',
              },
              {
                id: 'j-m2-l1-q2',
                question: 'What is a derived query method in Spring Data JPA?',
                options: [
                  'A method you write SQL for',
                  'A method whose name Spring parses to generate the SQL automatically',
                  'A native query',
                  'A stored procedure',
                ],
                correctAnswer: 1,
                explanation: 'Spring parses method names like findByEmail to generate the appropriate SELECT query.',
              },
              {
                id: 'j-m2-l1-q3',
                question: 'What should you use for schema migrations in production?',
                options: ['ddl-auto=update', 'Flyway or Liquibase', 'Manually editing the DB', 'Nothing — schema never changes'],
                correctAnswer: 1,
                explanation: 'Flyway/Liquibase give versioned, reviewable, reversible migrations — required for production safety.',
              },
            ],
          },
        ],
      },
      {
        id: 'j-m3',
        title: 'Module 3 — Frontend with React 18',
        description: 'Hooks, routing, and TanStack Query for server state.',
        lessons: [
          {
            id: 'j-m3-l1',
            title: 'React Hooks & Data Fetching',
            description: 'useState, useEffect, and useQuery for clean server state.',
            duration: '80 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Understand hooks',
                content:
                  'Hooks let function components hold state and side effects. useState returns a value and setter; useEffect runs side effects after render — return a cleanup function to unsubscribe. Always list every reactive value the effect depends on in the dependency array to avoid stale closures.',
                code: "const [count, setCount] = useState(0)\nuseEffect(() => {\n  const id = setInterval(() => setCount(c => c+1), 1000)\n  return () => clearInterval(id)\n}, [])",
                codeLanguage: 'tsx',
              },
              {
                title: 'Fetch data with TanStack Query',
                content:
                  'TanStack Query handles caching, refetching, and loading state for server data. Wrap your app in QueryClientProvider, then call useQuery with a unique key and a fetcher. The query is cached by key — components using the same key share data automatically.',
                code: "const { data, isLoading, error } = useQuery({\n  queryKey: ['tasks'],\n  queryFn: () => fetch('/api/tasks').then(r => r.json()),\n})",
                codeLanguage: 'tsx',
                tip: 'Use queryKey arrays consistently — they are the cache identity.',
              },
              {
                title: 'Mutations and invalidation',
                content:
                  'Use useMutation for POST/PUT/DELETE. On success, call queryClient.invalidateQueries to refetch related queries. This keeps the UI in sync without manually updating cache. Show optimistic updates for snappy UX by using onMutate to update cache before the server responds.',
                code: "const qc = useQueryClient()\nconst m = useMutation({\n  mutationFn: (newTask) => fetch('/api/tasks', {method:'POST', body: JSON.stringify(newTask)}),\n  onSuccess: () => qc.invalidateQueries({queryKey:['tasks']}),\n})",
                codeLanguage: 'tsx',
              },
            ],
            quiz: [
              {
                id: 'j-m3-l1-q1',
                question: 'What does useEffect\'s dependency array control?',
                options: [
                  'How many times the component renders',
                  'When the effect re-runs',
                  'The order of hooks',
                  'Whether the effect runs at all',
                ],
                correctAnswer: 1,
                explanation: 'The effect re-runs whenever any value in the dependency array changes between renders.',
              },
              {
                id: 'j-m3-l1-q2',
                question: 'What is the cache identity in TanStack Query?',
                options: ['The fetcher function', 'The queryKey', 'The component', 'The API URL'],
                correctAnswer: 1,
                explanation: 'queryKey uniquely identifies a query in the cache. Same key = shared data across components.',
              },
              {
                id: 'j-m3-l1-q3',
                question: 'Why use queryClient.invalidateQueries after a mutation?',
                options: [
                  'To clear the entire cache',
                  'To refetch queries whose data may have changed',
                  'To log out the user',
                  'To change the queryKey',
                ],
                correctAnswer: 1,
                explanation: 'Invalidation marks queries stale and triggers a background refetch, keeping the UI in sync with server state.',
              },
            ],
          },
        ],
      },
      {
        id: 'j-m4',
        title: 'Module 4 — Docker & Deployment',
        description: 'Containerize backend and frontend, then ship to the cloud.',
        lessons: [
          {
            id: 'j-m4-l1',
            title: 'Containerizing Your Full Stack App',
            description: 'Multi-stage Dockerfiles, docker-compose, and a CI pipeline.',
            duration: '75 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Write a multi-stage Dockerfile',
                content:
                  'Multi-stage builds keep the final image small. Stage 1 builds the JAR with Maven; stage 2 copies only the JAR into a slim JRE image. This shrinks the image from ~800MB to ~200MB and keeps build tools out of production.',
                code: 'FROM maven:3.9-eclipse-temurin-17 AS build\nWORKDIR /app\nCOPY pom.xml .\nRUN mvn -B dependency:go-offline\nCOPY src ./src\nRUN mvn -B package -DskipTests\n\nFROM eclipse-temurin:17-jre-alpine\nCOPY --from=build /app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java","-jar","/app.jar"]',
                codeLanguage: 'dockerfile',
              },
              {
                title: 'Compose the full stack',
                content:
                  'docker-compose lets you run backend, frontend, MySQL, and any other services with one command. Use named volumes for DB persistence and depends_on with healthchecks to ensure the DB is ready before the backend starts. Use environment variables for secrets so the same compose file works in dev and CI.',
                code: 'services:\n  db:\n    image: mysql:8\n    environment:\n      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}\n    volumes: [dbdata:/var/lib/mysql]\n  api:\n    build: ./backend\n    environment:\n      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/tasksdb\n    depends_on: [db]\n  web:\n    build: ./frontend\n    ports: ["3000:3000"]\nvolumes: { dbdata: {} }',
                codeLanguage: 'yaml',
                tip: 'Never commit real secrets to compose files — use .env files and .dockerignore.',
              },
              {
                title: 'Deploy with CI/CD',
                content:
                  'Set up GitHub Actions to build, test, and push images on every push to main. Use multi-arch builds (linux/amd64, linux/arm64) if you target both x86 clouds and ARM instances. Tag images with the git SHA, not just latest, so you can roll back precisely. Deploy by pulling the new image on your server or via a managed service like Cloud Run.',
                code: 'jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/build-push-action@v5\n        with:\n          push: true\n          tags: ghcr.io/org/api:${{ github.sha }}',
                codeLanguage: 'yaml',
              },
            ],
            quiz: [
              {
                id: 'j-m4-l1-q1',
                question: 'What is the main benefit of a multi-stage Docker build?',
                options: [
                  'Faster builds',
                  'Smaller final images by excluding build tools',
                  'Better security inside Docker',
                  'It is required by Kubernetes',
                ],
                correctAnswer: 1,
                explanation: 'Multi-stage builds copy only the build artifact into the final image, dropping Maven/Node and other build tools.',
              },
              {
                id: 'j-m4-l1-q2',
                question: 'Why tag images with the git SHA instead of just "latest"?',
                options: [
                  'It is faster',
                  'To enable precise rollbacks',
                  'It is required by Docker Hub',
                  'To reduce image size',
                ],
                correctAnswer: 1,
                explanation: 'SHA-tagged images are immutable and let you roll back to any specific build; "latest" is mutable and ambiguous.',
              },
              {
                id: 'j-m4-l1-q3',
                question: 'Why use depends_on with a healthcheck in docker-compose?',
                options: [
                  'To make services start in the right order and only when ready',
                  'To reduce memory use',
                  'To expose ports',
                  'To set environment variables',
                ],
                correctAnswer: 0,
                explanation: 'depends_on with condition: service_healthy ensures the DB is actually accepting connections before the API starts.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 179,
    monthlyPrice: 25,
    annualPrice: 249,
    onDemand: true,
    categoryIds: ['cat-backend', 'cat-web'],
    expiresAfterDays: 365,
  },

  // ============================================================
  // 3. .NET Full Stack
  // ============================================================
  {
    id: 'dotnet-fullstack',
    slug: 'dotnet-full-stack',
    title: '.NET Full Stack Development',
    subtitle: 'ASP.NET Core + C# + EF Core + Blazor',
    description: 'Master modern .NET with ASP.NET Core APIs, EF Core, and Blazor frontends.',
    longDescription:
      'This program turns you into a confident .NET full stack developer using the modern .NET 8 stack. You will learn C# 12 features, build REST APIs with ASP.NET Core minimal APIs and controllers, model data with Entity Framework Core against SQL Server or PostgreSQL, secure them with ASP.NET Identity and JWT, then build interactive frontends with Blazor Web App (server + Web Assembly). The course covers testing with xUnit, logging with Serilog, and containerized deployment. Each module includes step-wise labs, video walkthroughs, and graded assessments.',
    icon: 'Boxes',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    level: 'Intermediate',
    duration: '12 weeks',
    lessonsCount: 20,
    studentsCount: '6,420',
    rating: 4.8,
    instructor: 'Linda Park',
    instructorTitle: 'Microsoft MVP, .NET Architect',
    tags: ['C# 12', '.NET 8', 'ASP.NET Core', 'EF Core', 'Blazor', 'xUnit'],
    whatYouLearn: [
      'Write modern C# 12 with records, pattern matching, and nullable types',
      'Build REST APIs with ASP.NET Core minimal APIs and controllers',
      'Model databases with EF Core migrations and conventions',
      'Build interactive UIs with Blazor Web App and Web Assembly',
      'Secure apps with ASP.NET Identity and JWT bearer auth',
      'Test and deploy .NET apps with xUnit and Docker',
    ],
    prerequisites: [
      'Basic programming experience in any language',
      'Familiarity with HTTP and REST',
      'Visual Studio 2022 or VS Code with the C# Dev Kit',
    ],
    modules: [
      {
        id: 'd-m1',
        title: 'Module 1 — Modern C# & .NET 8',
        description: 'C# 12 features, project structure, and the .NET CLI.',
        lessons: [
          {
            id: 'd-m1-l1',
            title: 'Modern C# in 60 Minutes',
            description: 'Records, pattern matching, nullable reference types, and top-level statements.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Use records for immutable data',
                content:
                  'Records give you value-based equality and immutability for free, ideal for DTOs and domain values. Use the `with` expression to create modified copies. Records compile to classes by default but can be `record struct` for value semantics.',
                code: 'public record TaskDto(string Title, string? Description, bool Done);\nvar t1 = new TaskDto("Learn C#", "step 1", false);\nvar t2 = t1 with { Done = true };',
                codeLanguage: 'csharp',
              },
              {
                title: 'Pattern matching for clean branching',
                content:
                  'Modern C# supports switch expressions, property patterns, and tuple patterns. They replace verbose if-else chains with concise, expression-oriented code. The compiler also warns you about missing cases.',
                code: 'var label = task switch {\n  { Done: true } => "Completed",\n  { Title.Length: < 10 } => "Short",\n  _ => "Active"\n};',
                codeLanguage: 'csharp',
                tip: 'Enable nullable reference types project-wide — it catches null bugs at compile time.',
              },
              {
                title: 'Top-level statements',
                content:
                  'In .NET 6+, Program.cs can be just statements — no Main boilerplate. The compiler generates the Main method. This keeps entry points clean and is the default for new ASP.NET Core projects.',
                code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.MapGet("/", () => "Hello, .NET!");\napp.Run();',
                codeLanguage: 'csharp',
              },
            ],
            quiz: [
              {
                id: 'd-m1-l1-q1',
                question: 'What does a C# record provide that a class does not by default?',
                options: [
                  'Inheritance',
                  'Value-based equality and immutability helpers',
                  'Faster execution',
                  'Database mapping',
                ],
                correctAnswer: 1,
                explanation: 'Records give value-based equality, immutability, and the `with` expression out of the box.',
              },
              {
                id: 'd-m1-l1-q2',
                question: 'What do top-level statements remove from Program.cs?',
                options: ['Using directives', 'The Main method boilerplate', 'Namespace declarations', 'All classes'],
                correctAnswer: 1,
                explanation: 'Top-level statements let you write code directly; the compiler synthesizes the Main method.',
              },
              {
                id: 'd-m1-l1-q3',
                question: 'What is the benefit of enabling nullable reference types?',
                options: [
                  'Faster runtime performance',
                  'Compile-time warnings for possible null dereferences',
                  'Smaller binaries',
                  'No benefit, just style',
                ],
                correctAnswer: 1,
                explanation: 'Nullable reference types make null intent explicit and the compiler warns on potential null dereferences.',
              },
            ],
          },
        ],
      },
      {
        id: 'd-m2',
        title: 'Module 2 — ASP.NET Core APIs',
        description: 'Minimal APIs, controllers, dependency injection, and middleware.',
        lessons: [
          {
            id: 'd-m2-l1',
            title: 'Building APIs with Minimal APIs',
            description: 'Endpoint routing, DI, validation, and OpenAPI.',
            duration: '75 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Map endpoints',
                content:
                  'Minimal APIs let you define endpoints with one line. Group related endpoints with MapGroup and add shared filters or auth. Use IResult returns (TypedResults) for strongly-typed OpenAPI schemas.',
                code: 'var api = app.MapGroup("/api/tasks");\napi.MapGet("/", (ITaskService s) => s.GetAll());\napi.MapGet("/{id:int}", (int id, ITaskService s) =>\n    s.Get(id) is { } t ? Results.Ok(t) : Results.NotFound());',
                codeLanguage: 'csharp',
              },
              {
                title: 'Register services with DI',
                content:
                  '.NET\'s built-in DI container resolves dependencies via constructor injection. Register services with the right lifetime: AddScoped per request, AddTransient always new, AddSingleton once. Always program to interfaces so swapping implementations is trivial.',
                code: 'builder.Services.AddScoped<ITaskService, TaskService>();\nbuilder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(conn));',
                codeLanguage: 'csharp',
                tip: 'Never inject scoped services into singletons — it captures them and breaks per-request semantics.',
              },
              {
                title: 'Add validation',
                content:
                  'Use the [ApiController] attribute on controllers to get automatic 400 responses for invalid model state. For minimal APIs, use MiniValidation or FluentValidation. Always return a consistent error envelope with field-level messages so the frontend can render inline errors.',
                code: 'builder.Services.AddValidation();\napp.MapPost("/api/tasks", async (TaskDto dto, ITaskService s) =>\n{\n    if (!MiniValidator.TryValidate(dto, out var errors))\n        return Results.ValidationProblem(errors);\n    return Results.Created($"/api/tasks/{id}", await s.Create(dto));\n});',
                codeLanguage: 'csharp',
              },
            ],
            quiz: [
              {
                id: 'd-m2-l1-q1',
                question: 'Which DI lifetime should you use for a database context in ASP.NET Core?',
                options: ['Singleton', 'Scoped (per request)', 'Transient', 'None'],
                correctAnswer: 1,
                explanation: 'DbContext should be scoped so each request shares one context and it is disposed at the end of the request.',
              },
              {
                id: 'd-m2-l1-q2',
                question: 'What does [ApiController] do for controller-based APIs?',
                options: [
                  'Generates OpenAPI automatically',
                  'Enables automatic 400 responses for invalid model state',
                  'Adds JWT auth',
                  'Connects to SQL Server',
                ],
                correctAnswer: 1,
                explanation: '[ApiController] enables automatic model validation responses and other opinionated behaviors.',
              },
              {
                id: 'd-m2-l1-q3',
                question: 'Which method groups endpoints under a shared prefix in minimal APIs?',
                options: ['MapControllerRoute', 'MapGroup', 'UseRouting', 'MapAttributes'],
                correctAnswer: 1,
                explanation: 'MapGroup("/prefix") returns a builder that prepends the prefix to every endpoint mapped on it.',
              },
            ],
          },
        ],
      },
      {
        id: 'd-m3',
        title: 'Module 3 — EF Core & Blazor',
        description: 'Code-first migrations and Blazor interactive components.',
        lessons: [
          {
            id: 'd-m3-l1',
            title: 'EF Core Code-First Workflow',
            description: 'DbContext, migrations, and LINQ querying.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Define a DbContext',
                content:
                  'A DbContext is the entry point to the database. Define DbSets for each entity and override OnModelCreating for fine-grained mapping. EF Core convention handles most cases; use the Fluent API in OnModelCreating for constraints that conventions cannot express.',
                code: 'public class AppDb : DbContext {\n  public AppDb(DbContextOptions<AppDb> o) : base(o) {}\n  public DbSet<Task> Tasks => Set<Task>();\n  protected override void OnModelCreating(ModelBuilder b) {\n    b.Entity<Task>().HasIndex(t => t.Title).IsUnique();\n  }\n}',
                codeLanguage: 'csharp',
              },
              {
                title: 'Create migrations',
                content:
                  'Migrations let your schema evolve alongside your code. Use `dotnet ef migrations add Init` to scaffold a migration, then `dotnet ef database update` to apply it. Review every generated migration before applying — EF sometimes generates destructive operations like drops.',
                code: '# dotnet ef migrations add Init\n# dotnet ef database update',
                codeLanguage: 'bash',
                tip: 'Always run migrations on a staging DB before production; snapshot your prod DB first.',
              },
              {
                title: 'Query with LINQ',
                content:
                  'LINQ to Entities translates C# queries to SQL. Use AsNoTracking for read-only queries to skip change tracking and gain performance. Project to DTOs with Select() to avoid fetching unnecessary columns. Use Include/ThenInclude for related data, but be wary of cartesion explosions — split queries help.',
                code: 'var dtos = await db.Tasks\n    .AsNoTracking()\n    .Where(t => !t.Done)\n    .OrderBy(t => t.DueDate)\n    .Select(t => new TaskItem(t.Id, t.Title))\n    .ToListAsync();',
                codeLanguage: 'csharp',
              },
            ],
            quiz: [
              {
                id: 'd-m3-l1-q1',
                question: 'What does AsNoTracking() do in EF Core?',
                options: [
                  'Disables change tracking for read-only queries (faster)',
                  'Prevents the query from running',
                  'Adds row locking',
                  'Skips SQL execution',
                ],
                correctAnswer: 0,
                explanation: 'AsNoTracking() tells EF not to track returned entities, saving memory and CPU for read-only queries.',
              },
              {
                id: 'd-m3-l1-q2',
                question: 'Which command applies a migration to the database?',
                options: [
                  'dotnet ef migrations add',
                  'dotnet ef database update',
                  'dotnet ef scaffold',
                  'dotnet ef drop',
                ],
                correctAnswer: 1,
                explanation: '`dotnet ef database update` applies any pending migrations to the target database.',
              },
              {
                id: 'd-m3-l1-q3',
                question: 'Why project to a DTO with Select() rather than returning entities?',
                options: [
                  'To fetch fewer columns and avoid leaking internal fields',
                  'To make queries slower',
                  'To disable change tracking',
                  'It is required by EF Core',
                ],
                correctAnswer: 0,
                explanation: 'Projection to a DTO fetches only the columns you need and prevents exposing sensitive entity fields.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 179,
    monthlyPrice: 25,
    annualPrice: 249,
    onDemand: true,
    categoryIds: ['cat-backend', 'cat-cloud'],
    expiresAfterDays: 365,
  },

  // ============================================================
  // 4. Mobile App Development
  // ============================================================
  {
    id: 'mobile-dev',
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    subtitle: 'React Native + iOS/Android fundamentals',
    description: 'Build cross-platform native apps with React Native and learn native iOS/Android basics.',
    longDescription:
      'Become a confident mobile developer by building real cross-platform apps with React Native and Expo, then learn the native side of iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose) so you can integrate native modules when needed. The course covers navigation, state management, device APIs (camera, location, notifications), offline-first data, push notifications, app store deployment, and CI/CD with EAS. Each module includes step-wise labs, video walkthroughs, and graded quizzes.',
    icon: 'Smartphone',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    level: 'Intermediate',
    duration: '11 weeks',
    lessonsCount: 22,
    studentsCount: '7,210',
    rating: 4.7,
    instructor: 'Marcus Lee',
    instructorTitle: 'Mobile Lead, ex-Shopify',
    tags: ['React Native', 'Expo', 'iOS', 'Android', 'Swift', 'Kotlin'],
    whatYouLearn: [
      'Build cross-platform apps with React Native and Expo',
      'Navigate with React Navigation and manage state with Zustand',
      'Use device APIs: camera, location, push notifications, biometrics',
      'Build offline-first apps with local storage and sync',
      'Write native modules in Swift and Kotlin when JS is not enough',
      'Ship to App Store and Play Store with EAS Build and Submit',
    ],
    prerequisites: [
      'Solid JavaScript / React fundamentals',
      'A Mac is required for iOS builds (Xcode)',
      'An Android device or emulator for Android testing',
    ],
    modules: [
      {
        id: 'm-m1',
        title: 'Module 1 — React Native Foundations',
        description: 'Expo, components, styling, and core APIs.',
        lessons: [
          {
            id: 'm-m1-l1',
            title: 'Your First Expo App',
            description: 'Bootstrap, run on device, and understand the Expo workflow.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Create the project',
                content:
                  'Expo is the fastest way to start a React Native app. `npx create-expo-app@latest` scaffolds a project with TypeScript, Expo Router, and a working dev server. Expo Go lets you preview on a physical device by scanning a QR code — no Xcode or Android Studio needed for basic development.',
                code: 'npx create-expo-app@latest my-app\n cd my-app\n npx expo start',
                codeLanguage: 'bash',
              },
              {
                title: 'Understand core components',
                content:
                  'React Native ships a small set of primitives: View, Text, Image, ScrollView, FlatList, Pressable. These map to native UI on each platform (UIView on iOS, android.view.View on Android). Style components with the `style` prop using a StyleSheet object — most CSS-like properties are supported but in camelCase.',
                code: "import { View, Text, StyleSheet, Pressable } from 'react-native'\n<Pressable style={s.btn} onPress={go}><Text>Tap</Text></Pressable>\nconst s = StyleSheet.create({ btn: { padding: 12, backgroundColor: '#0f172a', borderRadius: 8 } })",
                codeLanguage: 'tsx',
                tip: 'Use Pressable over Button for full control over press states and styling.',
              },
              {
                title: 'Run on a device',
                content:
                  'Install Expo Go from the App Store or Play Store, then scan the QR code from the terminal. Live reload pushes code changes to the device in under a second. For deeper native work (custom native modules), you will eventually eject to a development build — but for most features Expo Go is sufficient.',
                code: '# press s in the terminal to switch to Expo Go\n# scan the QR code with your phone camera',
                codeLanguage: 'bash',
              },
            ],
            quiz: [
              {
                id: 'm-m1-l1-q1',
                question: 'What does Expo Go let you do?',
                options: [
                  'Run a React Native app on a physical device without Xcode or Android Studio',
                  'Compile native code',
                  'Submit apps to the App Store',
                  'Write Swift code',
                ],
                correctAnswer: 0,
                explanation: 'Expo Go is a sandboxed app that runs your JS bundle on-device, perfect for fast iteration without native builds.',
              },
              {
                id: 'm-m1-l1-q2',
                question: 'Which core component is best for rendering long lists efficiently?',
                options: ['ScrollView', 'FlatList', 'View', 'Text'],
                correctAnswer: 1,
                explanation: 'FlatList virtualizes rows — only visible items are mounted — making it efficient for thousands of items.',
              },
              {
                id: 'm-m1-l1-q3',
                question: 'Why prefer Pressable over Button?',
                options: [
                  'It supports full styling and press-state callbacks',
                  'It is the only one that handles taps',
                  'It is faster',
                  'Button is deprecated',
                ],
                correctAnswer: 0,
                explanation: 'Pressable gives full control over styles, hover/pressed states, and accessibility — Button is very limited.',
              },
            ],
          },
          {
            id: 'm-m1-l2',
            title: 'Navigation & State',
            description: 'Expo Router, tabs, and Zustand for app state.',
            duration: '65 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Use Expo Router',
                content:
                  'Expo Router brings file-based routing to React Native, mirroring Next.js conventions. Each file in /app becomes a route. Use layout files (_layout.tsx) to share navigation chrome across screens. Stack, tabs, and drawer navigators are all file-based.',
                code: "// app/_layout.tsx\nimport { Stack } from 'expo-router'\nexport default function Layout() {\n  return <Stack screenOptions={{ headerStyle: { backgroundColor: '#0f172a' } }} />\n}",
                codeLanguage: 'tsx',
              },
              {
                title: 'Manage state with Zustand',
                content:
                  'Zustand is a tiny, hook-based store that works beautifully in React Native. Define a store with create(), subscribe with a selector, and call actions to update. Avoid putting everything in one store — split by domain for clarity and performance.',
                code: "import { create } from 'zustand'\nconst useAuth = create((set) => ({\n  user: null,\n  signIn: (u) => set({ user: u }),\n  signOut: () => set({ user: null }),\n}))\nconst user = useAuth((s) => s.user)",
                codeLanguage: 'tsx',
                tip: 'Select only the slice of state you need — selectors prevent unnecessary re-renders.',
              },
              {
                title: 'Persist state to disk',
                content:
                  'Use zustand/middleware persist with AsyncStorage to keep state across app launches. This is great for auth tokens, theme preference, and onboarding state. Always encrypt sensitive data with expo-secure-store instead of plain AsyncStorage.',
                code: "import { persist } from 'zustand/middleware'\nimport AsyncStorage from '@react-native-async-storage/async-storage'\nconst useAuth = create(persist((set) => ({ user: null, signIn: (u) => set({user:u}) }), {\n  name: 'auth', storage: createJSONStorage(() => AsyncStorage),\n}))",
                codeLanguage: 'tsx',
              },
            ],
            quiz: [
              {
                id: 'm-m1-l2-q1',
                question: 'How does Expo Router map files to routes?',
                options: [
                  'Through a config file',
                  'Each file in /app becomes a route, like Next.js',
                  'It auto-generates routes from native code',
                  'Through a database',
                ],
                correctAnswer: 1,
                explanation: 'Expo Router uses file-based routing where files in /app map to routes, with _layout.tsx files for shared chrome.',
              },
              {
                id: 'm-m1-l2-q2',
                question: 'Where should you store sensitive tokens on a mobile device?',
                options: [
                  'Plain AsyncStorage',
                  'expo-secure-store (Keychain/Keystore)',
                  'In a global variable',
                  'In localStorage',
                ],
                correctAnswer: 1,
                explanation: 'expo-secure-store uses iOS Keychain and Android Keystore, which are encrypted and OS-protected.',
              },
              {
                id: 'm-m1-l2-q3',
                question: 'Why use selectors when reading from a Zustand store?',
                options: [
                  'To encrypt the store',
                  'To subscribe only to a slice of state and avoid extra re-renders',
                  'To persist to disk',
                  'To validate actions',
                ],
                correctAnswer: 1,
                explanation: 'Selectors return only the slice of state you need, so the component only re-renders when that slice changes.',
              },
            ],
          },
        ],
      },
      {
        id: 'm-m2',
        title: 'Module 2 — Device APIs',
        description: 'Camera, location, notifications, and biometrics.',
        lessons: [
          {
            id: 'm-m2-l1',
            title: 'Camera, Location & Push Notifications',
            description: 'Request permissions and use native device features.',
            duration: '80 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Request permissions',
                content:
                  'iOS and Android require explicit permission grants for camera, location, notifications, and other sensitive APIs. Use expo-image-picker or expo-camera and call requestPermissionsAsync() before use. Always explain why you need the permission in the dialog pretext — vague explanations lead to denials.',
                code: "import * as ImagePicker from 'expo-image-picker'\nconst { status } = await ImagePicker.requestCameraPermissionsAsync()\nif (status !== 'granted') return Alert.alert('Camera permission required')",
                codeLanguage: 'tsx',
              },
              {
                title: 'Capture and use the photo',
                content:
                  'After granting permission, launch the camera and capture an image. The result includes a URI you can upload or display. Compress images before upload — expo-image-manipulator lets you resize and recompress to keep uploads small.',
                code: "const result = await ImagePicker.launchCameraAsync({ mediaTypes: Images, quality: 0.7 })\nif (!result.canceled) {\n  const uri = result.assets[0].uri\n  await uploadToServer(uri)\n}",
                codeLanguage: 'tsx',
                tip: 'Set quality 0.7 and resize to 1080p max for a 5–10x reduction in upload size.',
              },
              {
                title: 'Register for push notifications',
                content:
                  'Use expo-notifications to register for push. On iOS, request permission then get the APNS token; on Android, configure a notification channel. Send the token to your backend, which uses the Expo push service to deliver notifications. Always handle incoming notifications in two modes: foreground (show banner) and background (navigate on tap).',
                code: "import * as Notifications from 'expo-notifications'\nconst { status } = await Notifications.requestPermissionsAsync()\nconst token = (await Notifications.getExpoPushTokenAsync()).data\nawait api.post('/devices', { token })",
                codeLanguage: 'tsx',
              },
            ],
            quiz: [
              {
                id: 'm-m2-l1-q1',
                question: 'When should you request camera permission?',
                options: [
                  'At app launch, all at once',
                  'Just before the user needs to use the camera, with a clear reason',
                  'Never — it is automatic',
                  'On every app launch',
                ],
                correctAnswer: 1,
                explanation: 'Request permissions in context so the user understands why. Bulk requests at launch have higher denial rates.',
              },
              {
                id: 'm-m2-l1-q2',
                question: 'Why compress images before upload?',
                options: [
                  'To save bandwidth and speed up uploads',
                  'Because the API requires it',
                  'To reduce memory on the device',
                  'It is required by Expo',
                ],
                correctAnswer: 0,
                explanation: 'Resizing and recompressing cuts upload size dramatically, improving speed and reducing data usage.',
              },
              {
                id: 'm-m2-l1-q3',
                question: 'What must you do with the push token after registering for notifications?',
                options: [
                  'Store it in AsyncStorage only',
                  'Send it to your backend so it can push via Expo Push Service',
                  'Nothing — Expo handles everything',
                  'Encrypt it locally',
                ],
                correctAnswer: 1,
                explanation: 'The backend needs the token to send pushes via Expo\'s push service (or APNs/FCM directly).',
              },
            ],
          },
        ],
      },
      {
        id: 'm-m3',
        title: 'Module 3 — Native Modules & Deployment',
        description: 'Bridge to native code and ship to the stores.',
        lessons: [
          {
            id: 'm-m3-l1',
            title: 'Shipping to App Store & Play Store',
            description: 'EAS Build, versioning, and store submission.',
            duration: '75 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Configure EAS',
                content:
                  'EAS Build compiles your app in Expo\'s cloud, removing the need for local Xcode/Android Studio setup. Configure eas.json with separate profiles for development, preview, and production. Set app version and build number in app.json — increment the build number on every submission.',
                code: '{\n  "build": {\n    "production": {\n      "android": { "buildType": "apk" },\n      "ios": { "applicationArchivePath": "build/app.ipa" }\n    }\n  }\n}',
                codeLanguage: 'json',
              },
              {
                title: 'Build in the cloud',
                content:
                  'Run `eas build --platform all` to compile iOS and Android binaries in parallel. Builds take 10–30 minutes depending on dependencies. EAS Submit then uploads the binary to App Store Connect and Play Console. You still need an Apple Developer account ($99/yr) and a Play Console account ($25 one-time).',
                code: '# eas login\n# eas build --platform all --profile production\n# eas submit --platform ios --latest',
                codeLanguage: 'bash',
                tip: 'Use EAS Update to ship JS-only changes instantly without re-submitting to the stores.',
              },
              {
                title: 'Prepare store listings',
                content:
                  'Both stores require screenshots, app descriptions, privacy policy URLs, and support contacts. Generate screenshots for every required device size with a tool like fastlane snapshot or a screenshot-as-a-service. Write a clear, keyword-rich description and include a short demo video — apps with videos convert significantly better.',
                code: '# fastlane snapshot generates localized screenshots\n# fastlane supply pushes metadata to Play Console',
                codeLanguage: 'bash',
              },
            ],
            quiz: [
              {
                id: 'm-m3-l1-q1',
                question: 'What does EAS Build do?',
                options: [
                  'Compiles your app in Expo\'s cloud without local native toolchain',
                  'Submits the app to the stores',
                  'Updates the JS bundle instantly',
                  'Generates store screenshots',
                ],
                correctAnswer: 0,
                explanation: 'EAS Build compiles native iOS/Android binaries in Expo\'s cloud, removing the need for local Xcode/Android Studio.',
              },
              {
                id: 'm-m3-l1-q2',
                question: 'Which number must you increment on every store submission?',
                options: ['App version only', 'Build number', 'Bundle ID', 'App ID'],
                correctAnswer: 1,
                explanation: 'Stores reject uploads with a build number that already exists; bump it on every submission.',
              },
              {
                id: 'm-m3-l1-q3',
                question: 'What is EAS Update useful for?',
                options: [
                  'Shipping JS-only changes instantly without re-submitting the binary',
                  'Compiling native code',
                  'Generating screenshots',
                  'Renewing certificates',
                ],
                correctAnswer: 0,
                explanation: 'EAS Update pushes JS bundle updates instantly, ideal for bug fixes and small feature tweaks between native releases.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 169,
    monthlyPrice: 23,
    annualPrice: 229,
    onDemand: true,
    categoryIds: ['cat-mobile', 'cat-frontend'],
    expiresAfterDays: 180,
  },

  // ============================================================
  // 5. Flutter Development
  // ============================================================
  {
    id: 'flutter-dev',
    slug: 'flutter-development',
    title: 'Flutter Development',
    subtitle: 'Dart + Flutter for cross-platform native apps',
    description: 'Build beautiful cross-platform apps with Flutter, Dart, and modern state management.',
    longDescription:
      'Master Google\'s Flutter framework to build natively compiled apps for mobile, web, and desktop from a single Dart codebase. The course starts with Dart fundamentals, then moves through Flutter widgets, layouts, navigation, and animations. You will learn modern state management with Riverpod, integrate REST and GraphQL APIs, persist data with Hive and Isar, write platform channels when you need native code, and ship to iOS, Android, and the web. Each module includes step-wise labs, video walkthroughs, and graded assessments.',
    icon: 'Wind',
    color: 'sky',
    gradient: 'from-sky-500 to-cyan-600',
    level: 'All Levels',
    duration: '10 weeks',
    lessonsCount: 20,
    studentsCount: '5,890',
    rating: 4.8,
    instructor: 'Aisha Patel',
    instructorTitle: 'Google Developer Expert, Flutter',
    tags: ['Dart', 'Flutter', 'Riverpod', 'Animations', 'Firebase', 'Web'],
    whatYouLearn: [
      'Write idiomatic Dart 3 with null safety and records',
      'Build responsive UIs with Flutter widgets and Material 3',
      'Manage state cleanly with Riverpod 2',
      'Integrate REST and GraphQL APIs with Dio and graphql_flutter',
      'Persist data locally with Hive and Isar',
      'Ship apps to iOS, Android, and web from one codebase',
    ],
    prerequisites: [
      'Basic programming experience in any language',
      'A Mac for iOS builds, or Windows/Linux for Android-only',
      'Android Studio or VS Code with the Flutter extension',
    ],
    modules: [
      {
        id: 'f-m1',
        title: 'Module 1 — Dart & Flutter Basics',
        description: 'Dart 3, widgets, layouts, and Material 3.',
        lessons: [
          {
            id: 'f-m1-l1',
            title: 'Dart 3 in One Hour',
            description: 'Null safety, records, pattern matching, and async.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Null safety',
                content:
                  'Dart 3 is sound null-safe: types are non-nullable by default. Use ? to make a type nullable, and ! to assert non-null. Use ?? to provide a default. Sound null safety means the compiler guarantees no null-dereference at runtime — entire classes of bugs simply cannot happen.',
                code: 'String name = "Aisha";      // non-null\nString? nickname;            // nullable\nprint(nickname?.length);     // null-safe access\nprint(nickname ?? "anon");   // default value',
                codeLanguage: 'dart',
              },
              {
                title: 'Records and pattern matching',
                content:
                  'Dart 3 records let you bundle multiple values without declaring a class. Pattern matching destructures them cleanly in switch expressions. Use records for ad-hoc returns and for typed JSON-like data without code generation.',
                code: '(String, int) user = ("Aisha", 30);\nvar (name, age) = user;\nvar label = switch (age) {\n  < 18 => "minor",\n  >= 18 && < 65 => "adult",\n  _ => "senior",\n};',
                codeLanguage: 'dart',
                tip: 'Use records to return multiple values from a function without a wrapper class.',
              },
              {
                title: 'Async with Future and Stream',
                content:
                  'Dart is single-threaded with an event loop. Use async/await for one-shot async work and Stream for sequences of events. Streams power everything from button taps to WebSocket messages. Use StreamController to create custom streams; useStreamBuilder in Flutter to render stream output declaratively.',
                code: 'Future<User> fetchUser() async {\n  final r = await http.get(Uri.parse("/api/me"));\n  return User.fromJson(jsonDecode(r.body));\n}\n\nStream<int> tick(int n) async* {\n  for (var i = 0; i < n; i++) { yield i; await Future.delayed(Duration(seconds:1)); }\n}',
                codeLanguage: 'dart',
              },
            ],
            quiz: [
              {
                id: 'f-m1-l1-q1',
                question: 'What does sound null safety guarantee?',
                options: [
                  'Code runs faster',
                  'No runtime null-dereference errors for non-nullable types',
                  'Memory is automatically freed',
                  'Streams never emit null',
                ],
                correctAnswer: 1,
                explanation: 'Sound null safety means the compiler statically proves non-nullable types never hold null.',
              },
              {
                id: 'f-m1-l1-q2',
                question: 'What does the ?? operator do in Dart?',
                options: [
                  'Throws if null',
                  'Returns the left value if non-null, else the right',
                  'Asserts non-null',
                  'Casts to non-null',
                ],
                correctAnswer: 1,
                explanation: 'a ?? b evaluates to a if a is non-null, otherwise b — the null-coalescing operator.',
              },
              {
                id: 'f-m1-l1-q3',
                question: 'Which Dart construct represents a sequence of async events?',
                options: ['Future', 'Stream', 'Record', 'Isolate'],
                correctAnswer: 1,
                explanation: 'A Stream emits a sequence of async values over time; Future represents a single async value.',
              },
            ],
          },
          {
            id: 'f-m1-l2',
            title: 'Building UIs with Widgets',
            description: 'Widget tree, layout, and Material 3 components.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Compose widgets',
                content:
                  'Everything in Flutter is a widget. Compose small widgets into trees. StatelessWidget is for UI that depends only on its inputs; StatefulWidget holds mutable state and rebuilds when setState is called. Always split widgets into small files and prefer composition over deep nesting.',
                code: 'class Counter extends StatefulWidget {\n  @override State<Counter> createState() => _CounterState();\n}\nclass _CounterState extends State<Counter> {\n  int n = 0;\n  @override Widget build(BuildContext c) => Text("$n");\n}',
                codeLanguage: 'dart',
              },
              {
                title: 'Lay out with Flex and Stack',
                content:
                  'Use Row and Column (Flex widgets) for linear layouts. Use Expanded to give children flexible space and Flexible for optional sizing. Use Stack for overlapping children, with Positioned to anchor them. Wrap content in SafeArea to avoid notches and system gestures.',
                code: 'Column(crossAxisAlignment: CrossAxisAlignment.start, children: [\n  Text("Title", style: theme.textTheme.titleLarge),\n  Expanded(child: ListView(...)),\n  Row(children: [Expanded(child: SaveButton()), CancelButton()]),\n])',
                codeLanguage: 'dart',
                tip: 'Always wrap your root in MaterialApp or CupertinoApp for proper theme and routing context.',
              },
              {
                title: 'Theme with Material 3',
                content:
                  'Material 3 (Material You) is enabled by default in Flutter 1.17+. Use ColorScheme.fromSeed to derive a consistent palette from a single seed color. Access theme via Theme.of(context) so your widgets respect light/dark mode automatically. Define a textTheme and reuse it across the app for consistent typography.',
                code: 'MaterialApp(\n  theme: ThemeData(\n    useMaterial3: true,\n    colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),\n  ),\n  home: HomeScreen(),\n)',
                codeLanguage: 'dart',
              },
            ],
            quiz: [
              {
                id: 'f-m1-l2-q1',
                question: 'When should you use a StatefulWidget over a StatelessWidget?',
                options: [
                  'Always — it is faster',
                  'When the widget holds mutable state that can change over time',
                  'When the widget has many children',
                  'Never — StatelessWidget is enough',
                ],
                correctAnswer: 1,
                explanation: 'StatefulWidget is needed only when the widget owns mutable state that triggers rebuilds via setState.',
              },
              {
                id: 'f-m1-l2-q2',
                question: 'Which widget is used to overlap children in Flutter?',
                options: ['Column', 'Row', 'Stack', 'ListView'],
                correctAnswer: 2,
                explanation: 'Stack lays out children on top of each other; use Positioned to anchor them within the stack.',
              },
              {
                id: 'f-m1-l2-q3',
                question: 'How do you get a consistent color palette from one color in Material 3?',
                options: [
                  'Manually define every shade',
                  'Use ColorScheme.fromSeed(seedColor: ...)',
                  'Use Colors.teal everywhere',
                  'It is automatic, no API needed',
                ],
                correctAnswer: 1,
                explanation: 'ColorScheme.fromSeed derives a full tonal palette from a single seed color, ensuring accessible contrast.',
              },
            ],
          },
        ],
      },
      {
        id: 'f-m2',
        title: 'Module 2 — State Management with Riverpod',
        description: 'Providers, AsyncValue, and reactive UI.',
        lessons: [
          {
            id: 'f-m2-l1',
            title: 'Riverpod Providers & AsyncValue',
            description: 'Clean state management without BuildContext.',
            duration: '75 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Define providers',
                content:
                  'Riverpod 2 uses providers as the unit of state. A provider can hold a value, compute derived state, or fetch async data. Use ref.read to invoke, ref.watch to subscribe. Providers do not depend on BuildContext so they are easy to test in isolation.',
                code: 'final counterProvider = StateNotifierProvider<Counter, int>((ref) => Counter());\nclass Counter extends StateNotifier<int> {\n  Counter() : super(0);\n  void inc() => state++;\n}',
                codeLanguage: 'dart',
              },
              {
                title: 'Handle async with AsyncValue',
                content:
                  'AsyncValue unifies loading, data, and error into one type. Use .when to render each case declaratively. Riverpod auto-caches results and supports retry on error. Use ref.watch(futureProvider) to get an AsyncValue that rebuilds the widget when state changes.',
                code: 'final userProvider = FutureProvider<User>((ref) async {\n  return fetchUser();\n});\nfinal av = ref.watch(userProvider);\nreturn av.when(loading: () => Loader(), error: (e,_) => Error(e), data: (u) => Profile(u));',
                codeLanguage: 'dart',
                tip: 'Combine AsyncValue.guard with try/catch to convert thrown exceptions into error states.',
              },
              {
                title: 'Invalidate and refresh',
                content:
                  'Call ref.invalidate(provider) to force a re-fetch — useful after a mutation. Use ref.listen for side effects like showing a snackbar on error. Always dispose long-lived providers carefully; autoDispose modifier cleans up when no widget listens.',
                code: 'ref.invalidate(userProvider);\nref.listen<AsyncValue<User>>(userProvider, (prev, next) {\n  if (next.hasError) showSnack("Failed to load user");\n});',
                codeLanguage: 'dart',
              },
            ],
            quiz: [
              {
                id: 'f-m2-l1-q1',
                question: 'What is the difference between ref.watch and ref.read?',
                options: [
                  'No difference',
                  'ref.watch subscribes to changes and rebuilds; ref.read reads once',
                  'ref.read is async',
                  'ref.watch is for state only',
                ],
                correctAnswer: 1,
                explanation: 'ref.watch subscribes so the widget rebuilds on change; ref.read reads the current value once without subscribing.',
              },
              {
                id: 'f-m2-l1-q2',
                question: 'What does AsyncValue.when let you do?',
                options: [
                  'Debounce async calls',
                  'Handle loading, error, and data cases declaratively',
                  'Cancel async work',
                  'Cache the result forever',
                ],
                correctAnswer: 1,
                explanation: 'AsyncValue.when requires you to handle all three states explicitly, making async UI robust.',
              },
              {
                id: 'f-m2-l1-q3',
                question: 'Why use ref.invalidate after a mutation?',
                options: [
                  'To clear the entire app state',
                  'To force a re-fetch of cached provider data',
                  'To log out the user',
                  'To change the provider type',
                ],
                correctAnswer: 1,
                explanation: 'ref.invalidate(provider) marks the provider dirty, causing its next watcher to re-fetch fresh data.',
              },
            ],
          },
        ],
      },
      {
        id: 'f-m3',
        title: 'Module 3 — Networking & Persistence',
        description: 'REST APIs with Dio and local data with Hive.',
        lessons: [
          {
            id: 'f-m3-l1',
            title: 'REST APIs & Local Storage',
            description: 'Dio client, interceptors, and Hive for offline-first storage.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Use Dio for HTTP',
                content:
                  'Dio is a powerful HTTP client with interceptors, form data, and cancellation. Add an interceptor to attach auth tokens and refresh them on 401. Use a single Dio instance configured at app startup and inject it into repositories — testing becomes trivial with a mock client.',
                code: 'final dio = Dio(BaseOptions(baseUrl: "https://api.example.com"));\ndio.interceptors.add(InterceptorsWrapper(\n  onRequest: (o, h) => o.headers["Authorization"] = "Bearer $token",\n  onError: (e, h) async { if (e.response?.statusCode == 401) { await refreshToken(); return h.retry(e.requestOptions); } },\n));',
                codeLanguage: 'dart',
              },
              {
                title: 'Define repositories',
                content:
                  'Wrap API calls in repository classes so the rest of the app depends on abstractions, not Dio directly. This makes it trivial to swap implementations (e.g., for a mock in tests). Repositories return domain models, not raw JSON, so the rest of the app is decoupled from the wire format.',
                code: 'class TaskRepo {\n  final Dio _dio;\n  TaskRepo(this._dio);\n  Future<List<Task>> all() async {\n    final r = await _dio.get("/tasks");\n    return (r.data as List).map((j) => Task.fromJson(j)).toList();\n  }\n}',
                codeLanguage: 'dart',
                tip: 'Generate fromJson/toJson with freezed + json_serializable to avoid hand-written JSON code.',
              },
              {
                title: 'Persist with Hive',
                content:
                  'Hive is a fast key-value NoSQL database written in pure Dart. Use it for caching, offline storage, and user preferences. Generate TypeAdapters with @HiveType annotations. For relational data, consider Drift (SQLite) or Isar instead. Always wrap storage calls in try/catch so a corrupted box does not crash the app.',
                code: '@HiveType(typeId: 0)\nclass Task extends HiveObject {\n  @HiveField(0) String title;\n  @HiveField(1) bool done;\n  Task(this.title, this.done);\n}\nawait Hive.openBox<Task>("tasks");\nbox.put("t1", Task("Learn Flutter", false));',
                codeLanguage: 'dart',
              },
            ],
            quiz: [
              {
                id: 'f-m3-l1-q1',
                question: 'What is the purpose of an HTTP interceptor in Dio?',
                options: [
                  'To cache every response',
                  'To modify requests/responses globally (e.g., attach tokens, refresh on 401)',
                  'To compress responses',
                  'To log out automatically',
                ],
                correctAnswer: 1,
                explanation: 'Interceptors let you cross-cut concerns like auth, logging, retries without duplicating code in every call.',
              },
              {
                id: 'f-m3-l1-q2',
                question: 'Why wrap API calls in repository classes?',
                options: [
                  'Because Dio requires it',
                  'To decouple the rest of the app from the HTTP client and wire format',
                  'To make the app slower',
                  'It is required by Flutter',
                ],
                correctAnswer: 1,
                explanation: 'Repositories expose domain models and abstract the wire format, making the app easy to test and refactor.',
              },
              {
                id: 'f-m3-l1-q3',
                question: 'What is Hive used for in Flutter?',
                options: [
                  'HTTP requests',
                  'Fast local key-value / NoSQL storage',
                  'State management',
                  'Animations',
                ],
                correctAnswer: 1,
                explanation: 'Hive is a pure-Dart NoSQL box store, ideal for caching and offline persistence.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 159,
    monthlyPrice: 22,
    annualPrice: 219,
    onDemand: true,
    categoryIds: ['cat-mobile', 'cat-frontend'],
    expiresAfterDays: 180,
  },
// ============================================================
  // 6. Python Programming — Beginner to Advanced
  // ============================================================
  {
    id: 'python-pro',
    slug: 'python-programming',
    title: 'Python Programming — Beginner to Advanced',
    subtitle: 'Master Python for web, data, automation, and AI',
    description: 'End-to-end Python course: syntax, OOP, data structures, web (Django/Flask), data science (NumPy/Pandas), automation, testing, and async.',
    longDescription:
      'This comprehensive Python program takes you from writing your first print statement to building production-grade applications. You will start with syntax, variables, control flow, and built-in data structures, then progress to functions, OOP, decorators, generators, and context managers. The course then branches into the three most in-demand Python domains: web development with Flask and Django, data analysis with NumPy/Pandas/Matplotlib, and automation/scripting. You will also master testing with pytest, async programming with asyncio, packaging with pip and pyproject.toml, and modern tooling (ruff, mypy, uv). Every chapter includes video walkthroughs, step-by-step labs, and graded assessments so you graduate with a portfolio of real Python projects.',
    icon: 'Code2',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    level: 'All Levels',
    duration: '12 weeks',
    lessonsCount: 24,
    studentsCount: '18,920',
    rating: 4.9,
    instructor: 'Vikram Iyer',
    instructorTitle: 'Senior Python Engineer, ex-Stripe',
    tags: ['Python 3.12', 'Flask', 'Django', 'NumPy', 'Pandas', 'asyncio', 'pytest', 'FastAPI'],
    whatYouLearn: [
      'Write idiomatic Python 3.12 — type hints, f-strings, dataclasses, pattern matching',
      'Master built-in data structures: lists, dicts, sets, tuples, comprehensions',
      'Build OOP systems with classes, inheritance, dunder methods, and ABCs',
      'Use decorators, generators, context managers, and async/await correctly',
      'Ship a Flask web app and a Django REST API with auth and Postgres',
      'Analyze data with NumPy + Pandas and visualize with Matplotlib/Seaborn',
      'Automate files, Excel, emails, and the browser with scripts',
      'Test with pytest, type-check with mypy, package with pyproject.toml',
    ],
    prerequisites: [
      'A computer with Windows, macOS, or Linux',
      'No prior programming experience needed (we start from zero)',
      'Willingness to practice 4-6 hours per week',
    ],
    modules: [
      // ------------------------------------------------------------
      // Chapter 1 — Python Foundations
      // ------------------------------------------------------------
      {
        id: 'py-m1',
        title: 'Chapter 1 — Python Foundations',
        description: 'Install Python, master syntax, variables, types, I/O, and control flow.',
        lessons: [
          {
            id: 'py-m1-l1',
            title: 'Setting Up Python 3.12 + Your First Program',
            description: 'Install Python, set up a virtual env, write hello world, run a script.',
            duration: '40 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Install Python 3.12',
                content: 'Download the official installer from python.org for Windows or macOS. On Linux, use your package manager (apt install python3.12). Verify with python --version in a fresh terminal.',
                code: '# Verify Python install\npython --version\n# Python 3.12.4\n\n# Verify pip\npip --version\n# pip 24.0',
                codeLanguage: 'bash',
                tip: 'On Windows, tick "Add Python to PATH" during install or you will not be able to run python from the terminal.',
              },
              {
                title: 'Create a virtual environment',
                content: 'A virtual environment isolates project dependencies so different projects can use different library versions without conflict. Always create one per project.',
                code: '# Create a venv named .venv\npython -m venv .venv\n\n# Activate it\n# macOS / Linux:\nsource .venv/bin/activate\n# Windows (PowerShell):\n.\\.venv\\Scripts\\Activate.ps1\n\n# Confirm activation — your prompt should be prefixed with (.venv)\nwhich python',
                codeLanguage: 'bash',
                tip: 'Add .venv/ to your .gitignore. Never commit a virtual environment folder.',
              },
              {
                title: 'Write your first Python program',
                content: 'Create a file called hello.py. Use print() to write to the console, and input() to read from it. Run the script with python hello.py.',
                code: '# hello.py\nname = input("What is your name? ")\nprint(f"Hello, {name}! Welcome to Python.")\n\n# Run it:\n# python hello.py',
                codeLanguage: 'python',
                tip: 'f-strings (f"...{var}...") are the modern, fast, readable way to format strings. Always prefer them over % or .format().',
              },
              {
                title: 'Install packages with pip',
                content: 'pip is the Python package manager. Install a package with pip install <name>, list installed packages with pip list, and freeze them to a requirements.txt file.',
                code: 'pip install requests\npip install pandas\n\npip list\npip freeze > requirements.txt\n\n# Reinstall from a requirements file:\npip install -r requirements.txt',
                codeLanguage: 'bash',
                tip: 'For modern projects, prefer pyproject.toml + uv (https://github.com/astral-sh/uv) — 10-100x faster than pip.',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l1-q1',
                question: 'Why use a virtual environment per project?',
                options: [
                  'It is required by Python',
                  'To isolate project dependencies and avoid version conflicts',
                  'To make Python run faster',
                  'To enable internet access',
                ],
                correctAnswer: 1,
                explanation: 'Each venv has its own site-packages, so two projects can use different versions of the same library without breaking each other.',
              },
              {
                id: 'py-m1-l1-q2',
                question: 'Which command activates a venv on macOS/Linux?',
                options: [
                  'python activate .venv',
                  '.venv\\Scripts\\activate',
                  'source .venv/bin/activate',
                  'pip activate .venv',
                ],
                correctAnswer: 2,
                explanation: 'On Unix-like systems, the activate script lives at .venv/bin/activate and is sourced with the shell built-in `source`.',
              },
              {
                id: 'py-m1-l1-q3',
                question: 'Which is the recommended way to format strings in modern Python?',
                options: ['% formatting', 'f-strings', 'string concatenation with +', '.format()'],
                correctAnswer: 1,
                explanation: 'f-strings (f"...{x}...") are the fastest and most readable, available since Python 3.6.',
              },
            ],
          },
          {
            id: 'py-m1-l2',
            title: 'Variables, Types & Operators',
            description: 'int, float, str, bool, dynamic typing, type hints, arithmetic, comparison, logical operators.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Dynamic typing basics',
                content: 'Python variables do not have a fixed type — the type lives on the value, not the name. You can rebind a name to any type. Use type() to inspect.',
                code: 'x = 42           # int\nx = "hello"      # now str\nx = [1, 2, 3]    # now list\n\nprint(type(x))   # <class \'list\'>',
                codeLanguage: 'python',
                tip: 'Dynamic typing is flexible but error-prone on large teams. Use type hints (next step) and a type checker like mypy.',
              },
              {
                title: 'Type hints',
                content: 'Type hints document intent and let tools (mypy, pyright, IDEs) catch bugs before runtime. They are optional and ignored at runtime.',
                code: 'def greet(name: str, times: int = 1) -> str:\n    return (f"Hello, {name}! " * times).strip()\n\nmessage: str = greet("marqaicourses", 3)\nprint(message)',
                codeLanguage: 'python',
                tip: 'Run `mypy yourfile.py` to type-check. It catches ~60% of bugs in production Python codebases.',
              },
              {
                title: 'Numbers and arithmetic',
                content: 'Python has int (unbounded), float (IEEE 754), and complex. Operators: + - * / // % **. Use // for floor division and ** for exponentiation.',
                code: 'a, b = 17, 5\nprint(a + b)    # 22\nprint(a / b)    # 3.4   (always float)\nprint(a // b)   # 3     (floor division)\nprint(a % b)    # 2     (modulo)\nprint(a ** b)   # 1419857 (power)\n\n# Beware float precision:\nprint(0.1 + 0.2)  # 0.30000000000000004\n\n# Use decimal for money:\nfrom decimal import Decimal\nprint(Decimal("0.1") + Decimal("0.2"))  # 0.3',
                codeLanguage: 'python',
                tip: 'Never use floats for money. Use decimal.Decimal with string arguments, or integer cents.',
              },
              {
                title: 'Strings and booleans',
                content: 'Strings are immutable sequences of Unicode code points. Booleans are True/False (capitalized). Use .upper(), .lower(), .strip(), .split(), .join() for common ops.',
                code: 's = "  marqaicourses  "\nprint(s.strip().upper())      # "MARQAICOURSES"\nprint(",".join(["a", "b", "c"]))  # "a,b,c"\nprint("marq" in s)             # True\n\nflag: bool = True\nprint(flag and not False)      # True',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l2-q1',
                question: 'What does 17 // 5 return in Python?',
                options: ['3.4', '3', '4', '2'],
                correctAnswer: 1,
                explanation: '// is floor division — it returns the integer floor of the quotient, dropping the remainder.',
              },
              {
                id: 'py-m1-l2-q2',
                question: 'Why should you not use float for monetary calculations?',
                options: [
                  'Floats are too slow',
                  'Floats have precision errors (e.g. 0.1 + 0.2 != 0.3)',
                  'Python does not support floats for math',
                  'Floats are deprecated',
                ],
                correctAnswer: 1,
                explanation: 'Binary floating point cannot exactly represent decimal fractions. Use decimal.Decimal with string args for money.',
              },
              {
                id: 'py-m1-l2-q3',
                question: 'Which statement about type hints is TRUE?',
                options: [
                  'Type hints change runtime behavior',
                  'Type hints are mandatory',
                  'Type hints are ignored at runtime and used by linters/checkers',
                  'Type hints only work for function parameters',
                ],
                correctAnswer: 2,
                explanation: 'Type hints are erased at runtime. Tools like mypy, pyright, and IDEs use them to catch type errors before the code runs.',
              },
            ],
          },
          {
            id: 'py-m1-l3',
            title: 'Control Flow — if / for / while',
            description: 'Conditionals, loops, range, enumerate, zip, break, continue, comprehensions.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Conditionals and truthiness',
                content: 'Use if / elif / else. Falsy values: None, False, 0, 0.0, "", [], {}, set(), (). Everything else is truthy. Use `in` to test membership.',
                code: 'score = 78\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\nprint(grade)  # C\n\n# Truthiness\nprint(bool([]))     # False\nprint(bool([0]))    # True — non-empty list',
                codeLanguage: 'python',
              },
              {
                title: 'for loops with range, enumerate, zip',
                content: 'Python for loops iterate over iterables. Use range() for counters, enumerate() to get index+value, zip() to walk multiple iterables in parallel.',
                code: '# range\nfor i in range(3):\n    print(i)  # 0, 1, 2\n\n# enumerate — preferred way to get index + value\nfruits = ["apple", "banana", "cherry"]\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")\n\n# zip — walk two lists in parallel\nnames = ["Anika", "Vikram"]\nages = [29, 34]\nfor name, age in zip(names, ages):\n    print(f"{name} is {age}")',
                codeLanguage: 'python',
                tip: 'Avoid `for i in range(len(items))`. Use `for i, item in enumerate(items)` instead — more Pythonic.',
              },
              {
                title: 'while loops, break, continue',
                content: 'while loops run as long as the condition is truthy. Use break to exit a loop early and continue to skip to the next iteration.',
                code: '# Guessing game\nimport random\ntarget = random.randint(1, 10)\nattempts = 0\nwhile True:\n    guess = int(input("Guess 1-10: "))\n    attempts += 1\n    if guess == target:\n        print(f"Got it in {attempts} tries!")\n        break\n    if guess < target:\n        print("Higher")\n    else:\n        print("Lower")',
                codeLanguage: 'python',
              },
              {
                title: 'Comprehensions',
                content: 'List, dict, and set comprehensions are the idiomatic way to transform and filter sequences in one line. Faster than .append() in a loop.',
                code: '# List comprehension\nsquares = [x * x for x in range(10)]\n# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\n# With filter\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Dict comprehension\nword_len = {w: len(w) for w in ["cat", "dog", "elephant"]}\n# {\'cat\': 3, \'dog\': 3, \'elephant\': 8}\n\n# Set comprehension\nunique_lens = {len(w) for w in ["cat", "dog", "elephant"]}\n# {3, 8}',
                codeLanguage: 'python',
                tip: 'If a comprehension spans more than 2 lines, refactor into a regular for loop for readability.',
              },
            ],
            quiz: [
              {
                id: 'py-m1-l3-q1',
                question: 'Which is the most Pythonic way to loop with an index?',
                options: [
                  'for i in range(len(items)): print(items[i])',
                  'for i, item in enumerate(items): print(i, item)',
                  'i = 0; while i < len(items): print(items[i]); i += 1',
                  'items.forEach((item, i) => print(i, item))',
                ],
                correctAnswer: 1,
                explanation: 'enumerate() yields (index, value) tuples — clean and efficient.',
              },
              {
                id: 'py-m1-l3-q2',
                question: 'What does [x*x for x in range(5) if x % 2 == 0] produce?',
                options: ['[0, 1, 4, 9, 16]', '[0, 4, 16]', '[0, 2, 4]', '[4, 16]'],
                correctAnswer: 1,
                explanation: 'It filters to even x (0, 2, 4) and squares each: 0, 4, 16.',
              },
              {
                id: 'py-m1-l3-q3',
                question: 'Which value is truthy in Python?',
                options: ['0', '""', '[]', '[0]'],
                correctAnswer: 3,
                explanation: 'A non-empty list (even one containing only zero) is truthy.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 2 — Built-in Data Structures
      // ------------------------------------------------------------
      {
        id: 'py-m2',
        title: 'Chapter 2 — Built-in Data Structures',
        description: 'Lists, tuples, dicts, sets — when to use each and how to use them well.',
        lessons: [
          {
            id: 'py-m2-l1',
            title: 'Lists & Tuples',
            description: 'Mutable vs immutable sequences, slicing, list methods, tuple unpacking.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Lists — ordered, mutable',
                content: 'Lists hold an ordered sequence of any objects. Use append(), extend(), insert(), pop(), remove(), sort(), reverse(). Lists are mutable.',
                code: 'nums = [3, 1, 4, 1, 5, 9, 2, 6]\nnums.append(5)         # [3, 1, 4, 1, 5, 9, 2, 6, 5]\nnums.sort()            # [1, 1, 2, 3, 4, 5, 5, 6, 9]\nnums.reverse()         # [9, 6, 5, 5, 4, 3, 2, 1, 1]\nprint(nums.count(5))   # 2\nprint(nums.index(4))   # 4',
                codeLanguage: 'python',
              },
              {
                title: 'Slicing',
                content: 'slice syntax: list[start:stop:step]. stop is exclusive. Negative indices count from the end. Slicing returns a new list (shallow copy).',
                code: 's = "marqaicourses Online Courses"\nprint(s[0:4])    # "marq"\nprint(s[-8:])    # "Courses"\nprint(s[::2])    # "mqacesOnieCuse"\nprint(s[::-1])   # "sesruoC enilnO sesruociqram"  (reverse)\n\n# Copy a list\noriginal = [1, 2, 3]\ncopy = original[:]',
                codeLanguage: 'python',
                tip: 'list[::-1] is the fastest idiomatic way to reverse a sequence in Python.',
              },
              {
                title: 'Tuples — immutable, hashable',
                content: 'Tuples are like lists but cannot be changed. They are hashable (can be dict keys / set members) and slightly faster. Use them for fixed records.',
                code: 'point = (10, 20)\nx, y = point              # tuple unpacking\nprint(x, y)               # 10 20\n\n# Tuple of tuples as a 2D lookup\nrgb = {\n    ("red", "dark"):   (139, 0, 0),\n    ("green", "dark"): (0, 100, 0),\n}\nprint(rgb[("red", "dark")])  # (139, 0, 0)\n\n# Single-element tuple needs a trailing comma\none = (42,)\nprint(type(one))  # <class \'tuple\'>',
                codeLanguage: 'python',
              },
              {
                title: 'Named tuples and dataclasses',
                content: 'For structured records with named fields, prefer dataclasses (mutable, modern) or NamedTuple (immutable, lightweight).',
                code: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n    label: str = ""\n\np = Point(10, 20, "origin")\nprint(p.x, p.y, p.label)   # 10 20 origin\nprint(p)                    # Point(x=10, y=20, label=\'origin\')',
                codeLanguage: 'python',
                tip: 'dataclasses auto-generate __init__, __repr__, and __eq__. Add @dataclass(frozen=True) for immutability.',
              },
            ],
            quiz: [
              {
                id: 'py-m2-l1-q1',
                question: 'What is the difference between a list and a tuple?',
                options: [
                  'Lists can hold mixed types, tuples cannot',
                  'Lists are mutable, tuples are immutable',
                  'Lists are faster, tuples are slower',
                  'There is no difference',
                ],
                correctAnswer: 1,
                explanation: 'Lists can be modified after creation; tuples cannot. Tuples are also hashable (can be dict keys).',
              },
              {
                id: 'py-m2-l1-q2',
                question: 'What does s[::-1] do?',
                options: [
                  'Returns the first character',
                  'Returns the last character',
                  'Returns the reversed sequence',
                  'Raises an error',
                ],
                correctAnswer: 2,
                explanation: 'slice [::-1] steps backward through the whole sequence, effectively reversing it.',
              },
              {
                id: 'py-m2-l1-q3',
                question: 'Which decorator auto-generates __init__ and __repr__ for a class?',
                options: ['@classmethod', '@staticmethod', '@dataclass', '@property'],
                correctAnswer: 2,
                explanation: '@dataclass (from dataclasses module) auto-generates boilerplate for plain data-holding classes.',
              },
            ],
          },
          {
            id: 'py-m2-l2',
            title: 'Dictionaries & Sets',
            description: 'Hash maps, dict methods, defaultdict, Counter, set operations.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Dicts — hash maps',
                content: 'Dicts map hashable keys to values. Insertion order is preserved (Python 3.7+). Use [] for get/set, .get() for safe access, .items() for iteration.',
                code: 'user = {"name": "Anika", "age": 29, "role": "admin"}\n\nprint(user["name"])            # Anika\nprint(user.get("email"))        # None (no KeyError)\nprint(user.get("email", "-"))   # "-"  (default)\n\nuser["email"] = "anika@marq.ai"  # add key\nuser["age"] = 30                  # update\n\nfor key, value in user.items():\n    print(f"{key} = {value}")',
                codeLanguage: 'python',
              },
              {
                title: 'defaultdict & Counter',
                content: 'collections.defaultdict auto-creates missing keys. collections.Counter counts hashable items. Both save boilerplate.',
                code: 'from collections import defaultdict, Counter\n\n# Group words by first letter\nwords = ["apple", "ant", "banana", "berry", "cherry"]\nby_letter = defaultdict(list)\nfor w in words:\n    by_letter[w[0]].append(w)\nprint(dict(by_letter))\n# {\'a\': [\'apple\', \'ant\'], \'b\': [\'banana\', \'berry\'], \'c\': [\'cherry\']}\n\n# Count word frequency\ntext = "the cat sat on the mat the cat"\nfreq = Counter(text.split())\nprint(freq.most_common(2))  # [(\'the\', 3), (\'cat\', 2)]',
                codeLanguage: 'python',
                tip: 'Counter is ~10x faster than a manual dict-counting loop because it is implemented in C.',
              },
              {
                title: 'Sets — unordered unique items',
                content: 'Sets store unique hashable items. Use them for membership tests (O(1)) and set algebra (union, intersection, difference).',
                code: 'a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\n\nprint(a | b)   # {1, 2, 3, 4, 5, 6}  union\nprint(a & b)   # {3, 4}              intersection\nprint(a - b)   # {1, 2}              difference\nprint(a ^ b)   # {1, 2, 5, 6}        symmetric difference\n\n# Membership test is O(1) vs O(n) for lists\nprint(3 in a)  # True',
                codeLanguage: 'python',
              },
              {
                title: 'Dict comprehensions & merging',
                content: 'Build dicts from iterables with comprehensions. Merge dicts with the | operator (Python 3.9+).',
                code: '# Square each value\nnums = [1, 2, 3, 4]\nsquares = {n: n * n for n in nums}\n# {1: 1, 2: 4, 3: 9, 4: 16}\n\n# Merge two dicts (3.9+)\ndefaults = {"theme": "light", "lang": "en"}\nuser_prefs = {"theme": "dark"}\nmerged = defaults | user_prefs\n# {\'theme\': \'dark\', \'lang\': \'en\'}',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m2-l2-q1',
                question: 'What is the time complexity of `key in dict`?',
                options: ['O(n)', 'O(log n)', 'O(1) average', 'O(n log n)'],
                correctAnswer: 2,
                explanation: 'Dicts are hash maps — average O(1) membership test. Worst case O(n) only with hash collisions.',
              },
              {
                id: 'py-m2-l2-q2',
                question: 'Which collection auto-creates missing keys with a default factory?',
                options: ['dict', 'OrderedDict', 'defaultdict', 'ChainMap'],
                correctAnswer: 2,
                explanation: 'collections.defaultdict(factory) calls factory() to create missing keys — e.g. defaultdict(list) auto-creates empty lists.',
              },
              {
                id: 'py-m2-l2-q3',
                question: 'What does Counter("a b b c c c".split()).most_common(1) return?',
                options: ["[('a', 1)]", "[('c', 3)]", "[('b', 2)]", "[('c', 3), ('b', 2), ('a', 1)]"],
                correctAnswer: 1,
                explanation: 'Counter counts occurrences. most_common(1) returns the single most frequent item with its count.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 3 — Functions, OOP, Functional Tools
      // ------------------------------------------------------------
      {
        id: 'py-m3',
        title: 'Chapter 3 — Functions, OOP & Functional Tools',
        description: 'Functions, args/kwargs, lambdas, classes, inheritance, decorators, generators.',
        lessons: [
          {
            id: 'py-m3-l1',
            title: 'Functions, *args, **kwargs',
            description: 'Defining, calling, default args, keyword args, varargs, type hints, lambdas.',
            duration: '50 min',
            videoUrl: SAMPLE_VIDEO_6,
            steps: [
              {
                title: 'Function basics',
                content: 'Define with def. Pass args by position or by name. Default args use =. Return None if no return statement.',
                code: 'def greet(name: str, greeting: str = "Hello") -> str:\n    return f"{greeting}, {name}!"\n\nprint(greet("Anika"))                # Hello, Anika!\nprint(greet("Vikram", "Hi"))         # Hi, Vikram!\nprint(greet(greeting="Yo", name="Riya"))  # Yo, Riya!',
                codeLanguage: 'python',
                tip: 'NEVER use a mutable default argument like def f(items=[]). The list is shared across calls! Use None and create inside.',
              },
              {
                title: '*args and **kwargs',
                content: '*args collects extra positional args into a tuple. **kwargs collects extra keyword args into a dict. Useful for flexible APIs and forwarding.',
                code: 'def log(message: str, *args, **kwargs) -> None:\n    print(f"[LOG] {message}")\n    if args:\n        print(f"  positional: {args}")\n    if kwargs:\n        print(f"  keyword:    {kwargs}")\n\nlog("started", "user1", "user2", level="info", retry=3)\n# [LOG] started\n#   positional: (\'user1\', \'user2\')\n#   keyword:    {\'level\': \'info\', \'retry\': 3}',
                codeLanguage: 'python',
              },
              {
                title: 'Lambda, map, filter, sorted',
                content: 'Lambdas are one-expression anonymous functions. Use them sparingly — prefer named functions for anything complex.',
                code: '# Sort users by age\nusers = [{"name": "Anika", "age": 29}, {"name": "Vikram", "age": 34}]\nyoungest = sorted(users, key=lambda u: u["age"])[0]\nprint(youngest)  # {\'name\': \'Anika\', \'age\': 29}\n\n# map and filter (prefer comprehensions in Python)\nnums = [1, 2, 3, 4, 5]\nsquares = list(map(lambda x: x * x, nums))\nevens = list(filter(lambda x: x % 2 == 0, nums))\n\n# Equivalent comprehensions (preferred):\nsquares = [x * x for x in nums]\nevens   = [x for x in nums if x % 2 == 0]',
                codeLanguage: 'python',
                tip: 'Prefer comprehensions over map/filter — they are more readable and usually faster.',
              },
              {
                title: 'Type hints for advanced signatures',
                content: 'Use typing module for collections, optional, callable, etc. In Python 3.9+ use built-in generics (list[int] instead of List[int]).',
                code: 'from typing import Optional, Callable\n\ndef first_or_none(items: list[int]) -> Optional[int]:\n    return items[0] if items else None\n\ndef apply(fn: Callable[[int], int], x: int) -> int:\n    return fn(x)\n\nprint(first_or_none([]))           # None\nprint(apply(lambda n: n * 2, 21))  # 42',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l1-q1',
                question: 'Why is `def f(items=[])` a bug?',
                options: [
                  'It is a syntax error',
                  'The default list is shared across all calls to f',
                  'You cannot use [] as a default',
                  'It works correctly',
                ],
                correctAnswer: 1,
                explanation: 'Default args are evaluated once at definition time. A mutable default persists across calls. Use def f(items=None): items = items or [] instead.',
              },
              {
                id: 'py-m3-l1-q2',
                question: 'What does **kwargs collect?',
                options: [
                  'Extra positional args as a tuple',
                  'Extra keyword args as a dict',
                  'All args as a list',
                  'Nothing — it is a syntax error',
                ],
                correctAnswer: 1,
                explanation: '**kwargs collects keyword arguments that do not match named parameters into a dict.',
              },
              {
                id: 'py-m3-l1-q3',
                question: 'Which is the modern preferred way to write a list of ints type hint?',
                options: ['List[int]', 'list[int]', 'List<Integer>', 'Array<int>'],
                correctAnswer: 1,
                explanation: 'Since Python 3.9, you can use built-in generics like list[int] directly. typing.List is now mostly unnecessary.',
              },
            ],
          },
          {
            id: 'py-m3-l2',
            title: 'Classes, Inheritance & Dunder Methods',
            description: 'Class basics, __init__, __repr__, __eq__, inheritance, super(), ABCs.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Class basics and __init__',
                content: 'Classes bundle data (attributes) and behavior (methods). __init__ runs after the object is created and sets initial state. self refers to the instance.',
                code: 'class BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount: float) -> None:\n        if amount <= 0:\n            raise ValueError("amount must be positive")\n        self.balance += amount\n\n    def withdraw(self, amount: float) -> None:\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\n\nacc = BankAccount("Anika", 100)\nacc.deposit(50)\nacc.withdraw(20)\nprint(acc.balance)  # 130',
                codeLanguage: 'python',
              },
              {
                title: 'Dunder methods',
                content: 'Dunder (double-underscore) methods implement Python protocols. __repr__ for debug output, __eq__ for ==, __lt__ for <, __len__ for len(), __str__ for str().',
                code: 'class Temperature:\n    def __init__(self, celsius: float):\n        self.celsius = celsius\n\n    def __repr__(self) -> str:\n        return f"Temperature({self.celsius}°C)"\n\n    def __eq__(self, other: object) -> bool:\n        if not isinstance(other, Temperature):\n            return NotImplemented\n        return self.celsius == other.celsius\n\n    def __lt__(self, other: "Temperature") -> bool:\n        return self.celsius < other.celsius\n\nt1 = Temperature(20)\nt2 = Temperature(30)\nprint(t1)            # Temperature(20°C)\nprint(t1 < t2)       # True\nprint(sorted([t2, t1]))  # [Temperature(20°C), Temperature(30°C)]',
                codeLanguage: 'python',
                tip: 'Implement __repr__ on every domain class — it makes debugging 10x easier and is the foundation for nice error messages.',
              },
              {
                title: 'Inheritance and super()',
                content: 'Subclasses inherit attributes and methods from a base class. Override methods to specialize. Call super() to invoke the parent implementation.',
                code: 'class SavingsAccount(BankAccount):\n    def __init__(self, owner: str, balance: float = 0.0, rate: float = 0.04):\n        super().__init__(owner, balance)\n        self.rate = rate\n\n    def apply_interest(self) -> None:\n        self.deposit(self.balance * self.rate)\n\ns = SavingsAccount("Vikram", 1000, rate=0.05)\ns.apply_interest()\nprint(s.balance)  # 1050.0',
                codeLanguage: 'python',
              },
              {
                title: 'Abstract base classes',
                content: 'Use abc.ABC and @abstractmethod to define interfaces that subclasses must implement. Trying to instantiate an abstract class raises TypeError.',
                code: 'from abc import ABC, abstractmethod\n\nclass PaymentGateway(ABC):\n    @abstractmethod\n    def charge(self, amount: float) -> bool:\n        ...\n\nclass StripeGateway(PaymentGateway):\n    def charge(self, amount: float) -> bool:\n        print(f"Charging ${amount} via Stripe")\n        return True\n\n# PaymentGateway()  # TypeError — cannot instantiate abstract class\ngw = StripeGateway()\ngw.charge(49.99)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l2-q1',
                question: 'What does __init__ do?',
                options: [
                  'Creates a new instance (allocates memory)',
                  'Initializes the instance after it is created',
                  'Deletes the instance',
                  'Compares two instances',
                ],
                correctAnswer: 1,
                explanation: '__new__ creates the instance. __init__ runs after and initializes attributes on the already-created object.',
              },
              {
                id: 'py-m3-l2-q2',
                question: 'Why call super().__init__() in a subclass?',
                options: [
                  'It is required syntax',
                  'To reuse the parent class initialization logic',
                  'To delete the parent class',
                  'To make the class abstract',
                ],
                correctAnswer: 1,
                explanation: 'super() returns a proxy for the parent class. Calling __init__ ensures the parent\'s setup runs and attributes are properly initialized.',
              },
              {
                id: 'py-m3-l2-q3',
                question: 'Which dunder method does sorted() use to compare objects?',
                options: ['__init__', '__repr__', '__lt__', '__iter__'],
                correctAnswer: 2,
                explanation: 'sorted() uses __lt__ (less-than) to establish ordering. Implement __lt__ to make a class sortable.',
              },
            ],
          },
          {
            id: 'py-m3-l3',
            title: 'Decorators & Generators',
            description: 'Function decorators, @property, generator functions with yield, lazy evaluation.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'Decorators — wrap a function',
                content: 'A decorator is a function that takes a function and returns a new function. Use @decorator syntax. Decorators are great for logging, caching, auth, retries.',
                code: 'import time\nfrom functools import wraps\n\ndef timed(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = fn(*args, **kwargs)\n        elapsed = (time.perf_counter() - start) * 1000\n        print(f"{fn.__name__} took {elapsed:.2f}ms")\n        return result\n    return wrapper\n\n@timed\ndef slow_sum(n: int) -> int:\n    return sum(range(n))\n\nprint(slow_sum(1_000_000))\n# slow_sum took 28.14ms\n# 499999500000',
                codeLanguage: 'python',
                tip: 'Always use @functools.wraps on your wrapper — it copies the original function\'s name, docstring, and signature so introspection still works.',
              },
              {
                title: '@property — managed attributes',
                content: '@property turns a method into a getter. Use @x.setter to add a setter. Great for validation, computed fields, and keeping APIs stable when you add logic later.',
                code: 'class Product:\n    def __init__(self, price: float):\n        self.price = price  # calls the setter\n\n    @property\n    def price(self) -> float:\n        return self._price\n\n    @price.setter\n    def price(self, value: float) -> None:\n        if value < 0:\n            raise ValueError("price cannot be negative")\n        self._price = value\n\np = Product(9.99)\nprint(p.price)        # 9.99\np.price = 12.50\n# p.price = -5  # ValueError',
                codeLanguage: 'python',
              },
              {
                title: 'Generators — lazy streams',
                content: 'A generator function uses yield instead of return. Each call to next() resumes execution until the next yield. Generators are memory-efficient for large or infinite sequences.',
                code: 'def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fibonacci()\nfor _ in range(10):\n    print(next(gen), end=" ")\n# 0 1 1 2 3 5 8 13 21 34\n\n# Memory-efficient line reader\ndef read_large_file(path):\n    with open(path) as f:\n        for line in f:\n            yield line.rstrip()',
                codeLanguage: 'python',
                tip: 'Use generators for streaming pipelines (read → transform → write). They let you process terabytes of data with constant memory.',
              },
              {
                title: 'Generator expressions & itertools',
                content: 'Generator expressions look like list comprehensions but use parentheses — they yield items lazily. itertools provides fast functional helpers.',
                code: 'import itertools\n\n# Generator expression — does not materialize the list\nnums = (x * x for x in range(1_000_000))\nprint(sum(nums))  # 333332833333500000\n\n# itertools — chains, cycles, permutations, combinations\nprint(list(itertools.combinations("ABC", 2)))\n# [(\'A\', \'B\'), (\'A\', \'C\'), (\'B\', \'C\')]\n\nfor a, b in zip(itertools.cycle([0, 1]), range(5)):\n    print(a, b, end=" | ")\n# 0 0 | 1 1 | 0 2 | 1 3 | 0 4 |',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m3-l3-q1',
                question: 'Why use @functools.wraps in a decorator?',
                options: [
                  'It is required syntax',
                  'To preserve the wrapped function\'s name and docstring',
                  'To make the function faster',
                  'To prevent the function from being called',
                ],
                correctAnswer: 1,
                explanation: 'Without @wraps, the wrapper function shadows the original — __name__ becomes "wrapper", docstrings are lost, and tools like help() break.',
              },
              {
                id: 'py-m3-l3-q2',
                question: 'What does a generator function use instead of return?',
                options: ['yield', 'send', 'emit', 'produce'],
                correctAnswer: 0,
                explanation: 'yield pauses the function and emits a value. The next call to next() resumes execution right after the yield.',
              },
              {
                id: 'py-m3-l3-q3',
                question: 'What is the difference between [x for x in range(N)] and (x for x in range(N))?',
                options: [
                  'No difference',
                  'The first is a list (eager), the second is a generator (lazy)',
                  'The first is a set, the second is a list',
                  'The first is faster',
                ],
                correctAnswer: 1,
                explanation: 'Square brackets build a list in memory. Parentheses create a generator that yields items one at a time, using O(1) memory.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 4 — Web Development (Flask & Django)
      // ------------------------------------------------------------
      {
        id: 'py-m4',
        title: 'Chapter 4 — Web Development with Flask & Django',
        description: 'Build a REST API with Flask, then a full web app with Django and DRF.',
        lessons: [
          {
            id: 'py-m4-l1',
            title: 'Flask REST API in 60 Minutes',
            description: 'Routes, JSON, request parsing, blueprints, error handling, running the server.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'Install Flask and create the app',
                content: 'Flask is a micro web framework — minimal core, you compose what you need. Install it and create app.py with a 5-line web server.',
                code: '# Install\npip install flask\n\n# app.py\nfrom flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.get("/health")\ndef health():\n    return jsonify(status="ok")\n\nif __name__ == "__main__":\n    app.run(debug=True, port=5000)\n\n# Run: python app.py\n# Visit: http://localhost:5000/health',
                codeLanguage: 'python',
              },
              {
                title: 'Path params, query params, JSON body',
                content: 'Use <type:name> in routes for path params. Use request.args for query strings. Use request.get_json() for JSON bodies.',
                code: 'from flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.get("/users/<int:user_id>")\ndef get_user(user_id: int):\n    return jsonify(id=user_id, name="Anika")\n\n@app.get("/search")\ndef search():\n    q = request.args.get("q", "")\n    limit = request.args.get("limit", 10, type=int)\n    return jsonify(query=q, limit=limit, results=[])\n\n@app.post("/users")\ndef create_user():\n    data = request.get_json()\n    return jsonify(created=data), 201',
                codeLanguage: 'python',
              },
              {
                title: 'Blueprints for modular routes',
                content: 'Group related routes into a Blueprint, then register it on the app. This keeps large apps organized.',
                code: '# users_api.py\nfrom flask import Blueprint, jsonify\n\nbp = Blueprint("users", __name__, url_prefix="/api/users")\n\n@bp.get("/")\ndef list_users():\n    return jsonify(users=[])\n\n@bp.get("/<int:user_id>")\ndef get_user(user_id: int):\n    return jsonify(id=user_id)\n\n# app.py\nfrom flask import Flask\nfrom users_api import bp as users_bp\n\napp = Flask(__name__)\napp.register_blueprint(users_bp)',
                codeLanguage: 'python',
              },
              {
                title: 'Error handling and validation',
                content: 'Use abort() and errorhandler to return proper HTTP errors. Use a validation library like pydantic or marshmallow for request bodies.',
                code: 'from flask import Flask, jsonify, request, abort\nfrom pydantic import BaseModel, ValidationError, Field\n\napp = Flask(__name__)\n\nclass NewUser(BaseModel):\n    name: str = Field(min_length=1, max_length=80)\n    email: str\n    age: int = Field(ge=0, le=150)\n\n@app.post("/users")\ndef create_user():\n    try:\n        user = NewUser.model_validate(request.get_json())\n    except ValidationError as e:\n        abort(400, description=e.errors())\n    return jsonify(user.model_dump()), 201\n\n@app.errorhandler(400)\ndef bad_request(err):\n    return jsonify(error=err.description), 400',
                codeLanguage: 'python',
                tip: 'Pair Flask with Flask-SQLAlchemy (ORM), Flask-Migrate (Alembic), and Flask-CORS for a complete backend stack.',
              },
            ],
            quiz: [
              {
                id: 'py-m4-l1-q1',
                question: 'Which decorator defines a GET route in Flask 2.3+?',
                options: ['@app.route("/x")', '@app.get("/x")', '@route(app, "/x")', '@http("GET", "/x")'],
                correctAnswer: 1,
                explanation: 'Flask 2.0+ added @app.get, @app.post, etc. — cleaner than @app.route("/x", methods=["GET"]).',
              },
              {
                id: 'py-m4-l1-q2',
                question: 'How do you read a JSON request body in Flask?',
                options: [
                  'request.body',
                  'request.json (or request.get_json())',
                  'request.data.json()',
                  'flask.read_json()',
                ],
                correctAnswer: 1,
                explanation: 'request.get_json() (or the request.json shortcut) parses the body as JSON and returns a dict.',
              },
              {
                id: 'py-m4-l1-q3',
                question: 'What are Blueprints for?',
                options: [
                  'Database models',
                  'Modular grouping of routes that get registered on the app',
                  'Authentication',
                  'Frontend templates',
                ],
                correctAnswer: 1,
                explanation: 'Blueprints group related routes + handlers so you can split a large app into multiple modules, then register them on the app.',
              },
            ],
          },
          {
            id: 'py-m4-l2',
            title: 'Django + DRF — Full Stack in One Hour',
            description: 'Project setup, models, migrations, serializers, viewsets, router, admin.',
            duration: '70 min',
            videoUrl: SAMPLE_VIDEO_4,
            steps: [
              {
                title: 'Install Django + DRF and scaffold the project',
                content: 'Django is a batteries-included web framework. Django REST Framework (DRF) adds serialization and browsable APIs on top.',
                code: 'pip install django djangorestframework\n\ndjango-admin startproject myproject .\npython manage.py startapp blog\n\n# myproject/settings.py — add to INSTALLED_APPS:\nINSTALLED_APPS = [\n    # ...\n    "rest_framework",\n    "blog",\n]\n\npython manage.py migrate\npython manage.py runserver',
                codeLanguage: 'bash',
              },
              {
                title: 'Define a model and run migrations',
                content: 'Models are Python classes that map to database tables. makemigrations generates SQL diffs; migrate applies them.',
                code: '# blog/models.py\nfrom django.db import models\nfrom django.utils import timezone\n\nclass Post(models.Model):\n    title = models.CharField(max_length=200)\n    slug = models.SlugField(unique=True)\n    body = models.TextField()\n    published_at = models.DateTimeField(default=timezone.now)\n    is_published = models.BooleanField(default=False)\n\n    def __str__(self) -> str:\n        return self.title\n\n# Terminal\npython manage.py makemigrations\npython manage.py migrate',
                codeLanguage: 'python',
              },
              {
                title: 'Serializer + ViewSet + Router',
                content: 'Serializers convert model instances to JSON. ViewSets define CRUD behavior. Routers wire ViewSets to URLs.',
                code: '# blog/serializers.py\nfrom rest_framework import serializers\nfrom .models import Post\n\nclass PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Post\n        fields = "__all__"\n\n# blog/views.py\nfrom rest_framework import viewsets\nfrom .models import Post\nfrom .serializers import PostSerializer\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer\n\n# blog/urls.py\nfrom rest_framework.routers import DefaultRouter\nfrom .views import PostViewSet\n\nrouter = DefaultRouter()\nrouter.register("posts", PostViewSet)\nurlpatterns = router.urls\n\n# myproject/urls.py — include them\nfrom django.urls import path, include\nurlpatterns = [path("api/", include("blog.urls"))]',
                codeLanguage: 'python',
                tip: 'ModelViewSet gives you GET /api/posts/, POST /api/posts/, GET /api/posts/<id>/, PUT/PATCH, DELETE — all 5 REST endpoints in ~10 lines of code.',
              },
              {
                title: 'Admin + auth + permissions',
                content: 'Django admin is a free CRUD UI. Register your model. Add auth with built-in User model + DRF permissions.',
                code: '# blog/admin.py\nfrom django.contrib import admin\nfrom .models import Post\n\n@admin.register(Post)\nclass PostAdmin(admin.ModelAdmin):\n    list_display = ("title", "published_at", "is_published")\n    list_filter = ("is_published",)\n    search_fields = ("title", "body")\n\n# Create a superuser\n# python manage.py createsuperuser\n# Visit http://localhost:8000/admin/\n\n# blog/views.py — require auth\nfrom rest_framework.permissions import IsAuthenticatedOrReadOnly\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer\n    permission_classes = [IsAuthenticatedOrReadOnly]',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m4-l2-q1',
                question: 'What does `python manage.py makemigrations` do?',
                options: [
                  'Applies migrations to the database',
                  'Generates SQL migration files by diffing models against the last migration',
                  'Creates a new Django app',
                  'Runs the test suite',
                ],
                correctAnswer: 1,
                explanation: 'makemigrations inspects your models and generates migration files. migrate then applies those files to the database.',
              },
              {
                id: 'py-m4-l2-q2',
                question: 'What does a DRF ModelViewSet give you out of the box?',
                options: [
                  'Only GET (list)',
                  'Only POST (create)',
                  'Full CRUD — list, retrieve, create, update, partial_update, destroy',
                  'Nothing — you write every action yourself',
                ],
                correctAnswer: 2,
                explanation: 'ModelViewSet mixins all 5 CRUD actions. You only need to set queryset and serializer_class.',
              },
              {
                id: 'py-m4-l2-q3',
                question: 'Which permission allows anyone to read but only authenticated users to write?',
                options: ['IsAuthenticated', 'AllowAny', 'IsAuthenticatedOrReadOnly', 'IsAdminUser'],
                correctAnswer: 2,
                explanation: 'IsAuthenticatedOrReadOnly permits GET/HEAD/OPTIONS for everyone; write methods (POST/PUT/PATCH/DELETE) require auth.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 5 — Data Science with NumPy & Pandas
      // ------------------------------------------------------------
      {
        id: 'py-m5',
        title: 'Chapter 5 — Data Science with NumPy & Pandas',
        description: 'Arrays, vectorization, DataFrames, groupby, joins, time series, plotting.',
        lessons: [
          {
            id: 'py-m5-l1',
            title: 'NumPy Arrays & Vectorization',
            description: 'ndarray creation, indexing, broadcasting, vectorized ops vs Python loops.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_5,
            steps: [
              {
                title: 'Install NumPy and create arrays',
                content: 'NumPy is the foundation of Python data science. Its ndarray is a fast, typed, multi-dimensional array.',
                code: 'pip install numpy\n\nimport numpy as np\n\n# From a list\na = np.array([1, 2, 3, 4, 5])\nprint(a.dtype, a.shape)  # int64 (5,)\n\n# From ranges\nprint(np.arange(0, 10, 2))  # [0 2 4 6 8]\nprint(np.linspace(0, 1, 5))  # [0.   0.25 0.5  0.75 1.  ]\n\n# 2D arrays (matrices)\nM = np.array([[1, 2, 3], [4, 5, 6]])\nprint(M.shape)  # (2, 3)\nprint(M.T)      # transpose — shape (3, 2)',
                codeLanguage: 'python',
              },
              {
                title: 'Vectorized operations',
                content: 'NumPy operations work element-wise on entire arrays without Python loops — 10-100x faster than equivalent list code.',
                code: 'import numpy as np\n\na = np.array([1, 2, 3, 4])\nb = np.array([10, 20, 30, 40])\n\nprint(a + b)     # [11 22 33 44]\nprint(a * b)     # [10 40 90 160]\nprint(a ** 2)    # [1 4 9 16]\nprint(np.sqrt(b))\n\n# Universal functions (ufuncs)\nprint(np.sin(np.pi * np.array([0, 0.5, 1.0])))\n\n# Reductions\nprint(a.sum(), a.mean(), a.std(), a.max())',
                codeLanguage: 'python',
                tip: 'Rule of thumb: if you wrote a for-loop over a NumPy array, you are doing it wrong. Look for the vectorized ufunc.',
              },
              {
                title: 'Broadcasting',
                content: 'Broadcasting lets NumPy operate on arrays of different shapes by virtually expanding the smaller one. Understand the rules to write clean vectorized code.',
                code: 'import numpy as np\n\n# Add scalar to array\nprint(np.array([1, 2, 3]) + 10)  # [11 12 13]\n\n# Add 1D to 2D — broadcasts along rows\nM = np.array([[1, 2, 3], [4, 5, 6]])\nv = np.array([10, 20, 30])\nprint(M + v)\n# [[11 22 33]\n#  [14 25 36]]\n\n# Normalize columns of a matrix\ndata = np.random.rand(100, 5)  # 100 rows, 5 features\nmeans = data.mean(axis=0)      # shape (5,)\nstds  = data.std(axis=0)       # shape (5,)\nnormalized = (data - means) / stds\nprint(normalized.mean(axis=0), normalized.std(axis=0))',
                codeLanguage: 'python',
              },
              {
                title: 'Fancy indexing & boolean masks',
                content: 'Use boolean arrays to filter, integer arrays to pick specific indices. Both create copies (not views).',
                code: 'import numpy as np\n\na = np.array([5, 1, 8, 3, 9, 2, 7])\n\n# Boolean mask\nmask = a > 4\nprint(a[mask])  # [5 8 9 7]\n\n# Combined condition\nprint(a[(a > 2) & (a < 8)])  # [5 3 7]\n\n# Fancy indexing\nprint(a[[0, 2, 5]])  # [5 8 2]\n\n# Where — return indices where condition is True\nidx = np.where(a > 4)\nprint(idx)  # (array([0, 2, 4, 6]),)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m5-l1-q1',
                question: 'Why is a NumPy vectorized operation faster than a Python for-loop?',
                options: [
                  'NumPy uses GPUs',
                  'NumPy operations run in optimized C without per-element Python overhead',
                  'Python loops are deprecated',
                  'NumPy uses multi-threading by default',
                ],
                correctAnswer: 1,
                explanation: 'NumPy ufuncs iterate in compiled C. Python for-loops pay interpreter overhead on every iteration — 10-100x slower.',
              },
              {
                id: 'py-m5-l1-q2',
                question: 'What is broadcasting?',
                options: [
                  'Sending arrays over a network',
                  'Virtually expanding arrays of different shapes so element-wise ops work',
                  'A type of loop optimization',
                  'A way to serialize arrays',
                ],
                correctAnswer: 1,
                explanation: 'Broadcasting aligns array shapes (from the trailing dimensions) and virtually expands smaller arrays so element-wise operations work without copies.',
              },
              {
                id: 'py-m5-l1-q3',
                question: 'What does `a[a > 4]` do?',
                options: [
                  'Returns indices where a > 4',
                  'Returns a new array containing only elements where a > 4',
                  'Modifies a in place',
                  'Raises an error',
                ],
                correctAnswer: 1,
                explanation: 'Boolean mask indexing returns a new array of the elements where the mask is True.',
              },
            ],
          },
          {
            id: 'py-m5-l2',
            title: 'Pandas — DataFrames, groupby, joins',
            description: 'Loading CSV/Excel, selecting, filtering, groupby aggregations, merges, pivot tables.',
            duration: '65 min',
            videoUrl: SAMPLE_VIDEO_6,
            steps: [
              {
                title: 'Install Pandas and load data',
                content: 'Pandas is the most-used data analysis library in Python. The DataFrame is a labeled 2D table.',
                code: 'pip install pandas\n\nimport pandas as pd\n\n# Load CSV\ndf = pd.read_csv("sales.csv")\n\n# Load Excel (needs openpyxl)\n# pip install openpyxl\ndf = pd.read_excel("sales.xlsx", sheet_name="2024")\n\n# Quick peek\nprint(df.head())         # first 5 rows\nprint(df.info())         # dtypes + non-null counts\nprint(df.describe())     # summary stats for numeric cols\nprint(df.shape)          # (rows, cols)',
                codeLanguage: 'python',
              },
              {
                title: 'Selecting, filtering, assigning',
                content: 'Use [] for column selection, .loc for label-based, .iloc for position-based. Boolean masks filter rows.',
                code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Select one column (Series)\namounts = df["amount"]\n\n# Select multiple columns (DataFrame)\nsubset = df[["date", "amount", "region"]]\n\n# Filter rows\nbig = df[df["amount"] > 1000]\neast = df[(df["region"] == "East") & (df["amount"] > 500)]\n\n# .loc — label + boolean\nbig_east = df.loc[df["region"] == "East", ["date", "amount"]]\n\n# .iloc — positional\ntop5 = df.iloc[:5]       # first 5 rows\nlast3 = df.iloc[-3:]     # last 3 rows\n\n# New column\ndf["amount_usd"] = df["amount"] * 0.012\ndf["is_big"] = df["amount"] > 1000',
                codeLanguage: 'python',
              },
              {
                title: 'groupby aggregations',
                content: 'groupby splits data by a key, applies an aggregation, and combines the result. The most-used Pandas pattern.',
                code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# Total revenue per region\nprint(df.groupby("region")["amount"].sum())\n\n# Multiple aggregations\nprint(df.groupby("region")["amount"].agg(["count", "mean", "sum"]))\n\n# Group by multiple columns\nprint(df.groupby(["region", "product"])["amount"].sum())\n\n# Named aggregations (cleaner column names)\nprint(df.groupby("region").agg(\n    total=("amount", "sum"),\n    avg=("amount", "mean"),\n    n=("amount", "count"),\n))',
                codeLanguage: 'python',
                tip: 'groupby + agg is the workhorse of data analysis. Learn it cold — every dashboard, report, and ML pipeline uses it.',
              },
              {
                title: 'Joins, merges, and pivot tables',
                content: 'pd.merge() joins DataFrames on key columns. pivot_table reshapes long → wide for reporting.',
                code: 'import pandas as pd\n\nsales = pd.read_csv("sales.csv")\nregions = pd.read_csv("regions.csv")  # region_id, region_name, country\n\n# Inner join (default)\nmerged = pd.merge(sales, regions, on="region_id", how="left")\n\n# Pivot table — region × product, sum of amount\npivot = pd.pivot_table(\n    merged,\n    values="amount",\n    index="region_name",\n    columns="product",\n    aggfunc="sum",\n    fill_value=0,\n    margins=True,  # adds All row/col\n)\nprint(pivot)',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m5-l2-q1',
                question: 'What does df.groupby("region")["amount"].sum() produce?',
                options: [
                  'A DataFrame with one row per region and a single "amount" column',
                  'A Series indexed by region with the sum of amount per region',
                  'The first row of each region',
                  'An error',
                ],
                correctAnswer: 1,
                explanation: 'groupby("region") splits, ["amount"] selects the column, .sum() reduces — result is a Series indexed by region.',
              },
              {
                id: 'py-m5-l2-q2',
                question: 'Which is the difference between .loc and .iloc?',
                options: [
                  'No difference',
                  '.loc uses labels, .iloc uses integer positions',
                  '.loc is faster',
                  '.iloc is read-only',
                ],
                correctAnswer: 1,
                explanation: '.loc indexes by label (row index value + column name). .iloc indexes by integer position (0-based).',
              },
              {
                id: 'py-m5-l2-q3',
                question: 'In pd.merge(a, b, how="left"), what happens to rows in a with no match in b?',
                options: [
                  'They are dropped',
                  'They are kept, with NaN for b\'s columns',
                  'They cause an error',
                  'They are duplicated',
                ],
                correctAnswer: 1,
                explanation: 'A left join keeps all rows of the left DataFrame. Unmatched rows get NaN for the right DataFrame\'s columns.',
              },
            ],
          },
        ],
      },
      // ------------------------------------------------------------
      // Chapter 6 — Testing, Async, Packaging, Production
      // ------------------------------------------------------------
      {
        id: 'py-m6',
        title: 'Chapter 6 — Testing, Async, Packaging & Production',
        description: 'pytest, asyncio, pyproject.toml, mypy, ruff, uv, deployment.',
        lessons: [
          {
            id: 'py-m6-l1',
            title: 'Testing with pytest',
            description: 'Test functions, fixtures, parametrize, coverage, mocking.',
            duration: '55 min',
            videoUrl: SAMPLE_VIDEO_1,
            steps: [
              {
                title: 'Install pytest and write your first test',
                content: 'pytest is the de-facto Python test framework. Test functions start with test_. Run pytest with no args to discover tests/.',
                code: 'pip install pytest\n\n# test_calculator.py\ndef add(a: int, b: int) -> int:\n    return a + b\n\ndef test_add_basic():\n    assert add(2, 3) == 5\n\ndef test_add_negatives():\n    assert add(-1, -1) == -2\n\ndef test_add_zero():\n    assert add(0, 0) == 0\n\n# Run: pytest -v',
                codeLanguage: 'python',
              },
              {
                title: 'Fixtures — setup/teardown reuse',
                content: 'Fixtures provide setup data or resources to tests via dependency injection. Use conftest.py to share fixtures across files.',
                code: 'import pytest\n\n# conftest.py\n@pytest.fixture\ndef sample_users():\n    return [\n        {"id": 1, "name": "Anika", "active": True},\n        {"id": 2, "name": "Vikram", "active": False},\n        {"id": 3, "name": "Riya", "active": True},\n    ]\n\n# test_users.py\ndef test_active_users_count(sample_users):\n    active = [u for u in sample_users if u["active"]]\n    assert len(active) == 2\n\ndef test_user_ids_unique(sample_users):\n    ids = [u["id"] for u in sample_users]\n    assert len(ids) == len(set(ids))',
                codeLanguage: 'python',
              },
              {
                title: 'Parametrized tests',
                content: 'Run the same test logic with multiple inputs. Eliminates copy-paste tests.',
                code: 'import pytest\n\ndef is_palindrome(s: str) -> bool:\n    s = s.lower().replace(" ", "")\n    return s == s[::-1]\n\n@pytest.mark.parametrize("word,expected", [\n    ("racecar", True),\n    ("Race car", True),\n    ("hello", False),\n    ("a", True),\n    ("", True),\n    ("ab", False),\n])\ndef test_palindrome(word, expected):\n    assert is_palindrome(word) is expected',
                codeLanguage: 'python',
                tip: 'pytest --cov=. --cov-report=html generates a coverage report. Aim for 80%+ on business logic.',
              },
              {
                title: 'Mocking external calls',
                content: 'Use unittest.mock.patch to replace external calls (HTTP, DB, file system) with fakes during tests.',
                code: 'from unittest.mock import patch, MagicMock\nimport requests\n\ndef get_user_email(user_id: int) -> str:\n    r = requests.get(f"https://api.example.com/users/{user_id}")\n    r.raise_for_status()\n    return r.json()["email"]\n\ndef test_get_user_email():\n    fake_response = MagicMock()\n    fake_response.json.return_value = {"email": "anika@marq.ai"}\n    fake_response.raise_for_status.return_value = None\n\n    with patch("requests.get", return_value=fake_response):\n        email = get_user_email(1)\n    assert email == "anika@marq.ai"',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l1-q1',
                question: 'What naming convention does pytest use to discover tests?',
                options: [
                  'Files start with Test, classes start with test',
                  'Files start with test_, functions start with test_',
                  'Tests must be in a tests/ folder',
                  'Tests must be registered in pytest.ini',
                ],
                correctAnswer: 1,
                explanation: 'pytest collects files matching test_*.py or *_test.py and runs functions matching test*.',
              },
              {
                id: 'py-m6-l1-q2',
                question: 'What are pytest fixtures for?',
                options: [
                  'They are required for every test',
                  'Reusable setup/teardown data via dependency injection',
                  'Mocking HTTP calls',
                  'Generating test reports',
                ],
                correctAnswer: 1,
                explanation: 'Fixtures provide ready-to-use setup (DB connections, sample data, temp files) that tests request by name as parameters.',
              },
              {
                id: 'py-m6-l1-q3',
                question: 'Why mock external calls in tests?',
                options: [
                  'To make tests faster and not depend on network/DB',
                  'To test fewer lines of code',
                  'Mocking is required by pytest',
                  'To make tests slower',
                ],
                correctAnswer: 0,
                explanation: 'Mocking isolates the code under test. Tests run fast, do not depend on external services, and can simulate errors.',
              },
            ],
          },
          {
            id: 'py-m6-l2',
            title: 'Async Programming with asyncio',
            description: 'async/await, event loop, asyncio.gather, aiohttp, async context managers.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_2,
            steps: [
              {
                title: 'async/await fundamentals',
                content: 'async def declares a coroutine. await suspends until the awaited coroutine completes. The event loop multiplexes many coroutines.',
                code: 'import asyncio\nimport time\n\nasync def greet(name: str, delay: float) -> str:\n    await asyncio.sleep(delay)\n    return f"Hello, {name}!"\n\nasync def main():\n    # Sequential — total time = 1 + 2 = 3s\n    a = await greet("Anika", 1.0)\n    b = await greet("Vikram", 2.0)\n    print(a, b)\n\nasyncio.run(main())',
                codeLanguage: 'python',
              },
              {
                title: 'Concurrent execution with asyncio.gather',
                content: 'gather() runs multiple coroutines concurrently — total time is the max, not the sum. This is the main performance win of async.',
                code: 'import asyncio\nimport time\n\nasync def fetch(url: str, delay: float) -> str:\n    await asyncio.sleep(delay)\n    return f"DATA from {url}"\n\nasync def main():\n    start = time.perf_counter()\n    # Concurrent — total time = max(1, 2, 0.5) = 2s, not 3.5s\n    results = await asyncio.gather(\n        fetch("api/users", 1.0),\n        fetch("api/orders", 2.0),\n        fetch("api/products", 0.5),\n    )\n    print(results)\n    print(f"Elapsed: {time.perf_counter() - start:.2f}s")\n\nasyncio.run(main())',
                codeLanguage: 'python',
                tip: 'async shines for I/O-bound work (HTTP, DB, files). For CPU-bound work, use multiprocessing — async will not help.',
              },
              {
                title: 'Async HTTP with aiohttp',
                content: 'aiohttp is the standard async HTTP client/server. Use it to fan out hundreds of requests concurrently.',
                code: 'import asyncio\nimport aiohttp\n\nasync def fetch_json(session: aiohttp.ClientSession, url: str):\n    async with session.get(url) as r:\n        r.raise_for_status()\n        return await r.json()\n\nasync def fetch_all(urls: list[str]):\n    async with aiohttp.ClientSession() as session:\n        return await asyncio.gather(*[fetch_json(session, u) for u in urls])\n\nurls = [\n    "https://api.github.com/users/python",\n    "https://api.github.com/users/microsoft",\n    "https://api.github.com/users/openai",\n]\nresults = asyncio.run(fetch_all(urls))\nfor r in results:\n    print(r["login"], r["public_repos"])',
                codeLanguage: 'python',
              },
              {
                title: 'Async context managers & queues',
                content: 'async with supports async __aenter__/__aexit__. asyncio.Queue is a producer-consumer queue for streaming pipelines.',
                code: 'import asyncio\n\nclass DbConnection:\n    async def __aenter__(self):\n        print("connecting...")\n        await asyncio.sleep(0.1)\n        return self\n\n    async def __aexit__(self, *exc):\n        print("closing...")\n        await asyncio.sleep(0.1)\n\n    async def query(self, q: str):\n        return f"result of {q}"\n\nasync def main():\n    async with DbConnection() as db:\n        print(await db.query("SELECT 1"))\n\nasyncio.run(main())',
                codeLanguage: 'python',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l2-q1',
                question: 'What does `await` do?',
                options: [
                  'Blocks the entire program until the coroutine finishes',
                  'Suspends the coroutine, returning control to the event loop, until the awaited future completes',
                  'Runs the coroutine in a new thread',
                  'Cancels the coroutine',
                ],
                correctAnswer: 1,
                explanation: 'await yields control to the event loop, which can run other coroutines while waiting. This is how async achieves concurrency on a single thread.',
              },
              {
                id: 'py-m6-l2-q2',
                question: 'If 3 coroutines take 1s, 2s, and 0.5s, what is the total time with asyncio.gather?',
                options: ['3.5s (sum)', '2s (max)', '1s (min)', '6s (sum * 2)'],
                correctAnswer: 1,
                explanation: 'gather runs them concurrently — total time is the longest individual coroutine.',
              },
              {
                id: 'py-m6-l2-q3',
                question: 'When does async NOT help performance?',
                options: [
                  'For HTTP requests',
                  'For database queries',
                  'For CPU-bound number-crunching work',
                  'For file I/O',
                ],
                correctAnswer: 2,
                explanation: 'Async helps I/O-bound work. For CPU-bound work (image processing, numerical loops), use multiprocessing to spread across cores.',
              },
            ],
          },
          {
            id: 'py-m6-l3',
            title: 'Packaging, Type-checking, Linting & Deployment',
            description: 'pyproject.toml, mypy, ruff, uv, Docker, deploy to a PaaS.',
            duration: '60 min',
            videoUrl: SAMPLE_VIDEO_3,
            steps: [
              {
                title: 'pyproject.toml — the modern project file',
                content: 'pyproject.toml replaces setup.py, requirements.txt, setup.cfg. It declares build system, project metadata, dependencies, and tool config in one file.',
                code: '# pyproject.toml\n[build-system]\nrequires = ["hatchling"]\nbuild-backend = "hatchling.build"\n\n[project]\nname = "marq-tasks"\nversion = "1.0.0"\ndescription = "Task automation CLI"\nrequires-python = ">=3.12"\ndependencies = [\n    "click>=8.1",\n    "rich>=13.0",\n    "requests>=2.31",\n]\n\n[project.optional-dependencies]\ndev = ["pytest>=8", "mypy>=1.10", "ruff>=0.5"]\n\n[project.scripts]\nmarq-tasks = "marq_tasks.cli:main"\n\n[tool.ruff]\nline-length = 100\ntarget-version = "py312"\n\n[tool.mypy]\nstrict = true',
                codeLanguage: 'toml',
              },
              {
                title: 'ruff + mypy — lint and type-check',
                content: 'ruff is a fast linter/formatter (replaces flake8, isort, black). mypy catches type errors. Both integrate with VS Code and pre-commit.',
                code: '# Install\npip install ruff mypy\n\n# Lint\nruff check .\n\n# Auto-fix\nruff check . --fix\n\n# Format\nruff format .\n\n# Type-check\nmypy src/\n\n# Strict mode (recommended for new projects)\nmypy --strict src/',
                codeLanguage: 'bash',
                tip: 'Set up pre-commit hooks so ruff + mypy run automatically before each commit. Catches issues at the source.',
              },
              {
                title: 'uv — 100x faster pip',
                content: 'uv (from Astral) is a drop-in replacement for pip + venv + pip-tools, written in Rust. Use it for instant installs.',
                code: '# Install uv\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Create venv + install in one command\nuv venv\nuv pip install -r requirements.txt\n\n# Or use uv as a project manager (recommended)\nuv init myproject\ncd myproject\nuv add requests rich\nuv add --dev pytest mypy ruff\nuv run pytest\nuv run python main.py',
                codeLanguage: 'bash',
              },
              {
                title: 'Dockerize and deploy',
                content: 'Containerize your app with a multi-stage Dockerfile for small images. Deploy to Fly.io, Railway, Render, or any container PaaS.',
                code: '# Dockerfile\nFROM python:3.12-slim AS builder\nWORKDIR /app\nRUN pip install --no-cache-dir uv\nCOPY pyproject.toml uv.lock ./\nRUN uv sync --frozen --no-dev\n\nFROM python:3.12-slim AS runtime\nWORKDIR /app\nCOPY --from=builder /app/.venv /app/.venv\nCOPY . .\nENV PATH="/app/.venv/bin:$PATH"\nCMD ["uvicorn", "app:api", "--host", "0.0.0.0", "--port", "8000"]\n\n# Build and run\ndocker build -t marq-tasks .\ndocker run -p 8000:8000 marq-tasks\n\n# Deploy to Fly.io\n# pip install flyctl\n# fly launch\n# fly deploy',
                codeLanguage: 'dockerfile',
                tip: 'Multi-stage Docker builds keep production images tiny (often <100MB) by not shipping dev dependencies or build tools.',
              },
            ],
            quiz: [
              {
                id: 'py-m6-l3-q1',
                question: 'What is pyproject.toml?',
                options: [
                  'A replacement for the .env file',
                  'The modern standard project config file (replaces setup.py, requirements.txt, setup.cfg)',
                  'A Docker config file',
                  'A type-checking config only',
                ],
                correctAnswer: 1,
                explanation: 'PEP 517/518 made pyproject.toml the standard place for build system, project metadata, dependencies, and tool config.',
              },
              {
                id: 'py-m6-l3-q2',
                question: 'What does ruff replace?',
                options: [
                  'pytest only',
                  'flake8 + isort + black (linting + formatting)',
                  'mypy only',
                  'Docker only',
                ],
                correctAnswer: 1,
                explanation: 'ruff is a single Rust-based tool that replaces flake8, isort, black, and many plugins. 10-100x faster than the Python originals.',
              },
              {
                id: 'py-m6-l3-q3',
                question: 'Why use a multi-stage Dockerfile?',
                options: [
                  'It is required by Docker',
                  'To keep production images small by not shipping dev tools and build artifacts',
                  'To run multiple apps in one container',
                  'To skip type checking',
                ],
                correctAnswer: 1,
                explanation: 'A builder stage installs deps and compiles. The runtime stage copies only what is needed. Result: tiny, secure images.',
              },
            ],
          },
        ],
      },
    ],
    oneTimePrice: 149,
    monthlyPrice: 19,
    annualPrice: 189,
    onDemand: true,
    categoryIds: ['cat-python', 'cat-backend', 'cat-ai'],
    expiresAfterDays: 365,
  },

];

export function findCourse(courseId: string | undefined): Course | undefined {
  if (!courseId) return undefined;
  return COURSES.find((c) => c.id === courseId);
}

export function findLesson(courseId: string | undefined, moduleId: string | undefined, lessonId: string | undefined) {
  if (!courseId || !moduleId || !lessonId) return undefined;
  const course = findCourse(courseId);
  if (!course) return undefined;
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return undefined;
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { course, module, lesson };
}

export function getAllLessons(courseId: string | undefined) {
  if (!courseId) return [];
  const course = findCourse(courseId);
  if (!course) return [];
  const out: { courseId: string; moduleId: string; lessonId: string; lesson: Lesson; title: string; module: string }[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      out.push({ courseId, moduleId: m.id, lessonId: l.id, lesson: l, title: l.title, module: m.title });
    }
  }
  return out;
}
