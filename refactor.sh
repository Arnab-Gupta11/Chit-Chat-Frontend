#!/bin/bash

# Auth Components
mkdir -p src/app/\(auth\)/register/_components/RegisterForm
mv src/components/auth/RegisterForm.tsx src/app/\(auth\)/register/_components/RegisterForm/RegisterForm.tsx

mkdir -p src/app/\(auth\)/login/_components/LoginForm
mv src/components/auth/LoginForm.tsx src/app/\(auth\)/login/_components/LoginForm/LoginForm.tsx

mkdir -p src/app/\(auth\)/forgot-password/_components/ForgotPasswordForm
mv src/components/auth/ForgotPasswordForm.tsx src/app/\(auth\)/forgot-password/_components/ForgotPasswordForm/ForgotPasswordForm.tsx

mkdir -p src/app/\(auth\)/reset-password/_components/ResetPasswordForm
mv src/components/auth/ResetPasswordForm.tsx src/app/\(auth\)/reset-password/_components/ResetPasswordForm/ResetPasswordForm.tsx

# Chat Components
mkdir -p src/app/\(main\)/c/\[conversationId\]/_components/MessageComposer
mv src/components/chat/MessageComposer.tsx src/app/\(main\)/c/\[conversationId\]/_components/MessageComposer/MessageComposer.tsx

mkdir -p src/app/\(main\)/c/\[conversationId\]/_components/ChatHeader
mv src/components/chat/ChatHeader.tsx src/app/\(main\)/c/\[conversationId\]/_components/ChatHeader/ChatHeader.tsx

mkdir -p src/app/\(main\)/c/\[conversationId\]/_components/MessageBubble
mv src/components/chat/MessageBubble.tsx src/app/\(main\)/c/\[conversationId\]/_components/MessageBubble/MessageBubble.tsx

mkdir -p src/app/\(main\)/c/\[conversationId\]/_components/MessageList
mv src/components/chat/MessageList.tsx src/app/\(main\)/c/\[conversationId\]/_components/MessageList/MessageList.tsx

# Layout Components
mkdir -p src/app/\(main\)/_components/Sidebar
mv src/components/layout/Sidebar.tsx src/app/\(main\)/_components/Sidebar/Sidebar.tsx

echo "Files moved successfully."
