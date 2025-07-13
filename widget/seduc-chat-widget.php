<?php
/**
 * Plugin Name: Assistente Virtual SEDUC-GO
 * Description: Widget de chat para suporte aos sistemas da SEDUC-GO
 * Version: 1.0.0
 * Author: SEDUC-GO
 */

// Evita acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class SeducChatWidget {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_footer', array($this, 'add_widget_config'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
    }
    
    public function enqueue_scripts() {
        // Carrega apenas no frontend
        if (!is_admin()) {
            wp_enqueue_script(
                'seduc-chat-widget',
                plugin_dir_url(__FILE__) . 'chat-widget.js',
                array(),
                '1.0.0',
                true
            );
        }
    }
    
    public function add_widget_config() {
        if (!is_admin()) {
            $api_url = get_option('seduc_api_url', 'https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app/api/chat');
            echo "<script>window.SEDUC_API_URL = '{$api_url}';</script>";
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Assistente SEDUC',
            'Assistente SEDUC',
            'manage_options',
            'seduc-chat-widget',
            array($this, 'admin_page')
        );
    }
    
    public function settings_init() {
        register_setting('seduc_chat_widget', 'seduc_api_url');
        register_setting('seduc_chat_widget', 'seduc_widget_enabled');
        
        add_settings_section(
            'seduc_chat_widget_section',
            'Configurações do Assistente Virtual',
            null,
            'seduc_chat_widget'
        );
        
        add_settings_field(
            'seduc_api_url',
            'URL da API',
            array($this, 'api_url_field'),
            'seduc_chat_widget',
            'seduc_chat_widget_section'
        );
        
        add_settings_field(
            'seduc_widget_enabled',
            'Ativar Widget',
            array($this, 'enabled_field'),
            'seduc_chat_widget',
            'seduc_chat_widget_section'
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Assistente Virtual SEDUC-GO</h1>
            
            <div class="card" style="max-width: 600px;">
                <h2>Configurações</h2>
                <form method="post" action="options.php">
                    <?php
                    settings_fields('seduc_chat_widget');
                    do_settings_sections('seduc_chat_widget');
                    submit_button();
                    ?>
                </form>
            </div>
            
            <div class="card" style="max-width: 600px; margin-top: 20px;">
                <h2>Como usar</h2>
                <p>O widget do Assistente Virtual aparecerá automaticamente no canto inferior direito de todas as páginas do site.</p>
                
                <h3>Funcionalidades:</h3>
                <ul>
                    <li>✅ Responde dúvidas sobre sistemas da SEDUC</li>
                    <li>✅ Suporte ao SIGE, SIAP, ReFormar VI</li>
                    <li>✅ Interface responsiva</li>
                    <li>✅ Não interfere no design do site</li>
                </ul>
                
                <h3>Para configurar:</h3>
                <ol>
                    <li>Insira a URL da API do assistente (fornecida pela TI)</li>
                    <li>Ative o widget</li>
                    <li>Salve as configurações</li>
                </ol>
                
                <p><strong>Suporte:</strong> Em caso de dúvidas, entre em contato com a equipe de TI da SEDUC.</p>
            </div>
        </div>
        <?php
    }
    
    public function api_url_field() {
        $value = get_option('seduc_api_url', 'https://assistente-virtual-seduc.vercel.app/api/chat');
        echo "<input type='url' name='seduc_api_url' value='{$value}' class='regular-text' required>";
        echo "<p class='description'>URL da API do assistente virtual (fornecida pela equipe de TI)</p>";
    }
    
    public function enabled_field() {
        $value = get_option('seduc_widget_enabled', '1');
        echo "<input type='checkbox' name='seduc_widget_enabled' value='1' " . checked(1, $value, false) . ">";
        echo "<label>Ativar o widget do assistente virtual</label>";
    }
}

// Inicializa o plugin apenas se o widget estiver ativado
if (get_option('seduc_widget_enabled', '1') == '1') {
    new SeducChatWidget();
}

// Hook de ativação
register_activation_hook(__FILE__, function() {
    add_option('seduc_api_url', 'https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app/api/chat');
    add_option('seduc_widget_enabled', '1');
});

// Hook de desativação
register_deactivation_hook(__FILE__, function() {
    delete_option('seduc_api_url');
    delete_option('seduc_widget_enabled');
});
?>
