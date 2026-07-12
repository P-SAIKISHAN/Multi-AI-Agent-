FROM jenkins/jenkins:lts

# Switch to root user to install packages
USER root

# Install system dependencies, Python 3, and python3-pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python so 'python' command works (automating step 9 of setup guide)
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install Docker CLI so Jenkins can run docker commands via mounted host docker socket
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Add jenkins user to docker group
RUN groupadd -f -g 999 docker && usermod -aG docker jenkins

# Switch back to the jenkins user
USER jenkins

# Expose ports for Jenkins web UI and agent connection
EXPOSE 8080 50000
