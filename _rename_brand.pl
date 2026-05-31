#!/usr/bin/perl
use strict;
use warnings;

# 1. QualiflowAI -> Qualiflow AI  (skip if followed by .[letter] = namespace or method)
s/QualiflowAI(?!\.[A-Za-z])/Qualiflow AI/g;

# 2. QualiFlowAI -> QualiFlow AI  (skip if followed by .[letter])
s/QualiFlowAI(?!\.[A-Za-z])/QualiFlow AI/g;

# 3. QualiFlowAi (wrong casing) -> QualiFlow AI
s/QualiFlowAi\b/QualiFlow AI/g;

# 4. Remaining QualiFlow -> QualiFlow AI
#    Skip: already "QualiFlow AI", "QualiFlowForm", "QualiFlow-Signature", "QualiFlow.[letter]"
s/QualiFlow(?! AI)(?!Form)(?!\.[A-Za-z])(?!-)/QualiFlow AI/g;

# 5. Remaining Qualiflow -> Qualiflow AI
#    Skip: already "Qualiflow AI", "Qualiflow.[letter]" (namespaces)
s/Qualiflow(?! AI)(?!\.[A-Za-z])/Qualiflow AI/g;
