<?php

namespace App\DataFixtures;

use App\Entity\Article;
use App\Entity\BlocCMS;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        /******
         * User 
         ******/
        $user = new User();
        $user
            ->setEmail(base64_decode('cGF1bG9wMzMyOTBAZ21haWwuY29t'))
            ->setName('Paul')
            ->setPassword('$argon2id$v=19$m=65536,t=4,p=1$7isd9hN3XJU7nQa1+dnqDA$hw5JKZuzU2OOhRfwmIbJ7xM16EZZ+0K+lILUxEC0lmU');
        $manager->persist($user);

        /******
         * ARTICLES 
         ******/
        $article = new Article();
        $article->setTitle('Déploiement de la première ligne du ReVE');
        $article->setSlug('deploiement-de-la-premiere-ligne-du-reve');
        $article->setAuthor('Paul');
        $article->setDateCreation(new \DateTime('2023-03-19 16:47:46'));
        $manager->persist($article);

        $article = new Article();
        $article->setTitle('Évolution de la pratique');
        $article->setSlug('evolution-de-la-pratique');
        $article->setAuthor('Pierre');
        $article->setDateCreation(new \DateTime('2023-03-22 23:18:56'));
        $article->setContent('<p style="text-align:center"><img alt="" src="https://pbs.twimg.com/media/Fl0t7ccWQAADumo?format=jpg&amp;name=large" style="height:375px; width:500px" /></p>');
        $manager->persist($article);
        
        $article = new Article();
        $article->setTitle('Bilan mi-mandat');
        $article->setSlug('bilan-mi-mandat');
        $article->setAuthor('Pierre');
        $article->setDateCreation(new \DateTime('2023-03-22 23:34:37'));
        $article->setContent('<p><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-001.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-002.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-003.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-004.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-005.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-006.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-007.jpg" style="height:1125px; width:1125px" /></p>');
        $manager->persist($article);
        
        $article = new Article();
        $article->setTitle('Radar');
        $article->setSlug('radar');
        $article->setAuthor('Loïc');
        $article->setDateCreation(new \DateTime('2023-03-22 23:39:16'));
        $article->setContent('<p><img alt="" src="/radar/radar.png" style="height:886px; width:1841px" /></p>');
        $manager->persist($article);


        $bloc_cms = new BlocCMS();
        $bloc_cms->setKey(BlocCMS::EVOLUTION_PRATIQUE_BEFORE);
        $bloc_cms->setContent('<p>Evolution de la pratique before graphique</p>');
        $manager->persist($bloc_cms);

        $bloc_cms = new BlocCMS();
        $bloc_cms->setKey(BlocCMS::EVOLUTION_PRATIQUE_AFTER);
        $bloc_cms->setContent('<p>Evolution de la pratique post graphique</p>');
        $manager->persist($bloc_cms);

        $bloc_cms = new BlocCMS();
        $bloc_cms->setKey(BlocCMS::ENGAGEMENT);
        $bloc_cms->setContent('<p>TODO : écrire contenu</p>');
        $manager->persist($bloc_cms);

        $bloc_cms = new BlocCMS();
        $bloc_cms->setKey(BlocCMS::HOME_SITE_DESCRIPTION);
        $bloc_cms->setContent("<div class='block-info'>
Ce site utilise et analyse les données publiques et les aménagements sur la métropole de Bordeaux afin de suivre :
<ul class=\"list-disc list-inside\">
<li>Le Réseaux Express Vélo</li>
<li>Les aménagements par commune</li>
<li>Les vitesses réelles en zone 30</li>
<li>La pratique du vélo</li>
</ul>
Vous trouverez également un Blog avec des articles épisodiques.<br>
Ces observations factuelles serviront à dresser un bilan de mi-mandat militant et \"politique\" de cet observatoire.<br>
Il nous permettra par exemple de juger si la vitesse de déploiement des différents aménagements est suffisament rapide.
</div>");
        $manager->persist($bloc_cms);

        $manager->flush();
    }
}
