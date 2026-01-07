import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    """
    A simple Convolutional Neural Network for CIFAR-10 classification.
    This architecture is used by both the Edge Workers and the Parameter Server.
    """
    def __init__(self):
        super(SimpleCNN, self).__init__()
        # Input channels (3 for RGB), 6 output channels, 5x5 convolution
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        # 6 input channels, 16 output channels, 5x5 convolution
        self.conv2 = nn.Conv2d(6, 16, 5)
        
        # Flattened size after two pooling layers: 16 * 5 * 5 = 400
        self.fc1 = nn.Linear(16 * 5 * 5, 120) 
        self.fc2 = nn.Linear(120, 84)
        # 10 output classes (e.g., plane, car, bird, cat, etc.)
        self.fc3 = nn.Linear(84, 10) 

    def forward(self, x):
        # -> Conv -> ReLU -> Pool
        x = self.pool(F.relu(self.conv1(x)))
        # -> Conv -> ReLU -> Pool
        x = self.pool(F.relu(self.conv2(x)))
        # Flatten all dimensions except the batch dimension (0)
        x = torch.flatten(x, 1) 
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x