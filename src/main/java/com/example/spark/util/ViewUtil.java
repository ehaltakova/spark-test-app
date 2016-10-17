package com.example.spark.util;

import java.util.Map;

import org.apache.velocity.app.VelocityEngine;

import com.example.spark.app.Path;

import spark.ModelAndView;
import spark.Request;
import spark.template.velocity.VelocityTemplateEngine;

/**
 * Velocity Template Engine Util class.
 * @author Elitza Haltakova
 *
 */
public class ViewUtil {
	
	public static String render(Request request, Map<String, Object> model, String templatePath) {
		if(model.get("msg") == null) { // user notification message
			model.put("msg", "");
		}
		if(request.session().attribute("userContext") == null) { // sessionmgr: isSetUserContext
			model.put("authenticated", false);
		}else {
			model.put("authenticated", true);
		}
        model.put("WebPath", Path.class); // application URLs
        return getVelocityTemplateEngine().render(new ModelAndView(model, templatePath));
    }
	
	private static VelocityTemplateEngine getVelocityTemplateEngine() {
        VelocityEngine configuredEngine = new VelocityEngine();
        configuredEngine.setProperty("runtime.references.strict", true);
        configuredEngine.setProperty("resource.loader", "class");
        configuredEngine.setProperty("class.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        return new VelocityTemplateEngine(configuredEngine);
    }
}
