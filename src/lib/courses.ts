import { Course } from './types';

// Sample video URLs (open-source / public domain sample videos)
const SAMPLE_VIDEO_1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_VIDEO_2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const SAMPLE_VIDEO_3 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const SAMPLE_VIDEO_4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
const SAMPLE_VIDEO_5 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';

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
  },
];

export function findCourse(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

export function findLesson(courseId: string, moduleId: string, lessonId: string) {
  const course = findCourse(courseId);
  if (!course) return null;
  const mod = course.modules.find((m) => m.id === moduleId);
  if (!mod) return null;
  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, module: mod, lesson };
}

export function getAllLessons(courseId: string) {
  const course = findCourse(courseId);
  if (!course) return [];
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ courseId, moduleId: m.id, lessonId: l.id, title: l.title, module: m.title }))
  );
}
