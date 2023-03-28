<?php

namespace App\DataFixtures;

use App\Entity\Article;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        /******
         * User 
         ******/

        /******
         * ARTICLES 
         ******/
        $article = new Article();
        $article->setTitle('Déploiement de la première ligne du ReVE');
        $article->setSlug('deploiement-de-la-premiere-ligne-du-reve');
        $article->getAuthor('Paul');
        $article->setDateCreation(new \DateTime('2023-03-19 16:47:46'));
        $manager->persist($article);

        $article = new Article();
        $article->setTitle('Évolution de la pratique');
        $article->setSlug('evolution-de-la-pratique');
        $article->getAuthor('Pierre');
        $article->setDateCreation(new \DateTime('2023-03-22 23:18:56'));
        $article->setContent('<p style="text-align:center"><img alt="" src="https://pbs.twimg.com/media/Fl0t7ccWQAADumo?format=jpg&amp;name=large" style="height:375px; width:500px" /></p>');
        $manager->persist($article);
        
        $article = new Article();
        $article->setTitle('Bilan mi-mandat');
        $article->setSlug('bilan-mi-mandat');
        $article->getAuthor('Pierre');
        $article->setDateCreation(new \DateTime('2023-03-22 23:34:37'));
        $article->setContent('<p><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-001.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-002.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-003.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-004.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-005.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-006.jpg" style="height:1125px; width:1125px" /><img alt="" src="/evolution-amenagements/Evolution_Amenagements_Bordeaux-page-007.jpg" style="height:1125px; width:1125px" /></p>');
        $manager->persist($article);
        
        $article = new Article();
        $article->setTitle('Radar');
        $article->setSlug('radar');
        $article->getAuthor('Loïc');
        $article->setDateCreation(new \DateTime('2023-03-22 23:39:16'));
        $article->setContent('<p><img alt="" src="/radar/radar.png" style="height:886px; width:1841px" /></p>');
        $manager->persist($article);

        $manager->flush();
    }
}
