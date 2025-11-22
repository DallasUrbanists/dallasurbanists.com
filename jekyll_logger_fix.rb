begin
  require 'logger'

  class ::Logger
    # Make `level` robust if an initializer didn't set `@level_override`.
    # This happens when subclasses (like Jekyll::Stevenson) override
    # `initialize` without calling `super` (Ruby 3.3 introduced
    # `@level_override` usage in Logger#level).
    unless instance_methods(false).include?(:__patched_level)
      alias_method :__patched_level, :level

      def level
        fiber = ::Fiber.current
        (@level_override ||= {})[fiber] || @level
      end
    end
  end
rescue LoadError
  # If logger isn't available for some reason, skip patch.
end
