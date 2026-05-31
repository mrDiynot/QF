// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.SignalR;
using QualiFlow.API.Hubs;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.ChatWidgets.Interfaces;

namespace QualiFlow.API.Services;

/// <summary>
/// Implementation of IChatHubNotifier using SignalR PublicChatHub.
/// </summary>
public sealed class ChatHubNotifier : IChatHubNotifier
{
    private readonly IHubContext<PublicChatHub, IPublicChatHubClient> _hubContext;

    public ChatHubNotifier(IHubContext<PublicChatHub, IPublicChatHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    /// <inheritdoc/>
    public async Task BroadcastAIResponseAsync(Guid sessionId, ChatMessageDto message, CancellationToken cancellationToken = default)
    {
        var sessionGroup = $"chat_session_{sessionId}";
        await _hubContext.Clients.Group(sessionGroup).ReceiveAIResponse(message);
    }

    /// <inheritdoc/>
    public async Task BroadcastTypingIndicatorAsync(Guid sessionId, bool isTyping, CancellationToken cancellationToken = default)
    {
        var sessionGroup = $"chat_session_{sessionId}";
        await _hubContext.Clients.Group(sessionGroup).TypingIndicator(sessionId, isTyping);
    }

    /// <inheritdoc/>
    public async Task BroadcastAIStreamTokenAsync(Guid sessionId, Guid messageId, string token, bool isComplete, CancellationToken cancellationToken = default)
    {
        var sessionGroup = $"chat_session_{sessionId}";
        await _hubContext.Clients.Group(sessionGroup).ReceiveAIStreamToken(messageId, token, isComplete);
    }
}
