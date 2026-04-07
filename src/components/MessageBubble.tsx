import { Message } from '@/store/chatStore';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 items-start',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full shrink-0 h-8 w-8',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <span className="text-xs text-muted-foreground">
          {isUser ? 'You' : 'Assistant'}
        </span>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border rounded-tl-sm'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Product Cards */}
        {message.products && message.products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 w-full">
            {message.products.map((product) => (
              <a
                key={product.index_number}
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.product_image_url}
                    alt={`${product.brand} ${product.product_category}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground">
                    {product.index_number}. {product.brand}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {message.timestamp && (
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
